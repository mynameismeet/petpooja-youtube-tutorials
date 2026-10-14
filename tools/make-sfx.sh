#!/usr/bin/env bash
# House SFX set, synthesised with ffmpeg (original sounds, no licence needed).
#   tools/make-sfx.sh            -> sfx/{click,whoosh,riser,success}.wav (48 kHz stereo)
# The mixer uses videos/<slug>/audio/sfx/<name>.wav first, then falls back to sfx/.
set -euo pipefail
OUT="$(cd "$(dirname "$0")/.." && pwd)/sfx"; mkdir -p "$OUT"
FMT="aformat=sample_fmts=s16:channel_layouts=stereo,aresample=48000"
gen() { ffmpeg -v error -y "$@"; }

# click — soft UI tick: two short sine blips + a tiny noise transient
gen -f lavfi -i "aevalsrc=0.55*sin(2*PI*1800*t)*exp(-t*70)+0.25*sin(2*PI*3600*t)*exp(-t*110):s=48000:d=0.09" \
    -f lavfi -i "anoisesrc=color=white:r=48000:d=0.012:a=0.25" \
    -filter_complex "[1]highpass=f=2500,afade=t=out:st=0:d=0.012[n];[0][n]amix=inputs=2:normalize=0,highpass=f=600,afade=t=out:st=0.07:d=0.02,$FMT" \
    "$OUT/click.wav"

# whoosh — pink noise swell with a phaser sweep and a gentle left→right pan
gen -f lavfi -i "anoisesrc=color=pink:r=48000:d=0.7:a=0.7" \
    -af "highpass=f=300,lowpass=f=4500,aphaser=in_gain=0.8:out_gain=0.9:delay=2.5:decay=0.55:speed=1.4,volume='pow(sin(PI*t/0.7),3)':eval=frame,$FMT,apulsator=hz=0.7:amount=0.45" \
    "$OUT/whoosh.wav"

# riser — 4.4 s pitch glide 180→1400 Hz + rising airy noise; ends at its peak (cut on the reveal)
D=4.4
gen -f lavfi -i "aevalsrc=0.32*pow(t/$D\,1.6)*sin(2*PI*(180*t+1220*t*t*t/(3*$D*$D))):s=48000:d=$D" \
    -f lavfi -i "anoisesrc=color=white:r=48000:d=$D:a=0.6" \
    -filter_complex "[1]highpass=f=1800,volume='0.5*pow(t/$D,2.2)':eval=frame[n];[0][n]amix=inputs=2:normalize=0,aecho=0.8:0.5:40|90:0.25|0.15,afade=t=in:d=0.4,afade=t=out:st=$(echo "$D-0.02" | bc):d=0.02,$FMT" \
    "$OUT/riser.wav"

# success — two-note bell chime (C6 → G6) with a short room tail
B="sin(2*PI*F*T)*exp(-4.5*T)+0.35*sin(4*PI*F*T)*exp(-7*T)+0.15*sin(6*PI*F*T)*exp(-9*T)"
N1=$(echo "$B" | sed 's/F/1046.5/g; s/T/t/g')
N2=$(echo "$B" | sed 's/F/1568/g; s/T/(t-0.11)/g')
gen -f lavfi -i "aevalsrc=0.35*($N1)+0.32*if(gte(t\,0.11)\,$N2\,0):s=48000:d=1.4" \
    -af "afade=t=in:d=0.004,aecho=0.8:0.55:70|140:0.28|0.16,afade=t=out:st=1.2:d=0.2,$FMT" \
    "$OUT/success.wav"

# trim the riser so its peak IS the last sample, then peak-normalise all four to -3 dBFS
ffmpeg -v error -y -i "$OUT/riser.wav" -af "atrim=0:$D" "$OUT/riser.tmp.wav" && mv "$OUT/riser.tmp.wav" "$OUT/riser.wav"
for f in click whoosh riser success; do
  pk=$(ffmpeg -i "$OUT/$f.wav" -af volumedetect -f null - 2>&1 | grep -oE 'max_volume: [-0-9.]+' | cut -d' ' -f2)
  ffmpeg -v error -y -i "$OUT/$f.wav" -af "volume=$(echo "-3 - ($pk)" | bc)dB" "$OUT/$f.tmp.wav" && mv "$OUT/$f.tmp.wav" "$OUT/$f.wav"
done

for f in click whoosh riser success; do
  printf "%-8s %5.2fs  peak %s dB\n" "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$f.wav")" \
    "$(ffmpeg -i "$OUT/$f.wav" -af volumedetect -f null - 2>&1 | grep -oE 'max_volume: [-0-9.]+' | cut -d' ' -f2)"
done

// Registry: every tutorial that has an edit.ts. tools/new-video.sh adds new entries.
import type { VideoEdit } from "../lib/video";
import { VIDEO as marketingAutomation } from "./marketing-automation/edit";

export const VIDEOS: VideoEdit[] = [
  marketingAutomation,
  // new videos are added above this line
];

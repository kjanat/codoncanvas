/**
 * Icon components - re-exports from @heroicons/react/24/outline
 * with aliases for backwards compatibility
 *
 * Custom icons kept for: GitHubIcon, DnaIcon (not available in Heroicons)
 */

// Re-export Heroicons with our naming conventions
export {
  ArrowDownTrayIcon as SaveIcon,
  ArrowUpTrayIcon as UploadIcon,
  ArrowUturnLeftIcon as UndoIcon,
  ArrowUturnRightIcon as RedoIcon,
  BackwardIcon as RewindIcon,
  Bars3Icon as MenuIcon,
  BookOpenIcon as BookIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ComputerDesktopIcon as SystemIcon,
  DocumentDuplicateIcon as CopyIcon,
  EllipsisVerticalIcon as DotsVerticalIcon,
  ExclamationCircleIcon as ErrorIcon,
  ExclamationTriangleIcon as WarningIcon,
  HomeIcon,
  MoonIcon,
  PhotoIcon as GalleryIcon,
  PlayCircleIcon as PlayIcon,
  ShareIcon,
  SunIcon,
  XMarkIcon as CloseIcon,
  XMarkIcon as XIcon,
} from "@heroicons/react/24/outline";

// Custom brand icons (not available in Heroicons)
export { DnaIcon, GitHubIcon } from "./brand";

// Types
export type { IconProps } from "./types";

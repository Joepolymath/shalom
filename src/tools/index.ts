import type { Tool } from "../types.js";
import { readFileTool } from "./files/read-file.js";
import { writeFileTool } from "./files/write-file.js";
import { listDirectoryTool } from "./files/list-directory.js";
import { deleteFileTool } from "./files/delete-file.js";
import { moveFileTool } from "./files/move-file.js";
import { copyFileTool } from "./files/copy-file.js";
import { searchContentTool } from "./files/search-content.js";
import { directoryTreeTool } from "./files/directory-tree.js";
import { fileInfoTool } from "./files/file-info.js";
import { notionSearchTool } from "./notion/search.js";
import { notionCreatePageTool } from "./notion/create-page.js";
import { notionReadPageTool } from "./notion/read-page.js";
import { notionUpdatePageTool } from "./notion/update-page.js";
import { notionDeletePageTool } from "./notion/delete-page.js";
import { notionQueryDatabaseTool } from "./notion/query-database.js";
import { notionCreateDatabaseTool } from "./notion/create-database.js";
import { notionListDatabasesTool } from "./notion/list-databases.js";
import { notionCreateBlockTool } from "./notion/create-block.js";
import { notionReadBlocksTool } from "./notion/read-blocks.js";
import { notionUpdateBlockTool } from "./notion/update-block.js";
import { notionDeleteBlockTool } from "./notion/delete-block.js";
import { notionAddCommentTool } from "./notion/add-comment.js";
import { notionListCommentsTool } from "./notion/list-comments.js";
import { listProcessesTool } from "./system/list-processes.js";
import { cpuUsageTool } from "./system/cpu-usage.js";
import { killProcessTool } from "./system/kill-process.js";
import { systemInfoTool } from "./system/system-info.js";
import { remindersListListsTool } from "./macos/reminders/list-lists.js";
import { remindersListTool } from "./macos/reminders/list-reminders.js";
import { remindersCreateTool } from "./macos/reminders/create-reminder.js";
import { remindersCompleteTool } from "./macos/reminders/complete-reminder.js";
import { remindersDeleteTool } from "./macos/reminders/delete-reminder.js";
import { notesListFoldersTool } from "./macos/notes/list-folders.js";
import { notesListTool } from "./macos/notes/list-notes.js";
import { notesReadTool } from "./macos/notes/read-note.js";
import { notesSearchTool } from "./macos/notes/search-notes.js";
import { notesCreateTool } from "./macos/notes/create-note.js";
import { notesDeleteTool } from "./macos/notes/delete-note.js";
import { calendarListCalendarsTool } from "./macos/calendar/list-calendars.js";
import { calendarListEventsTool } from "./macos/calendar/list-events.js";
import { calendarCreateEventTool } from "./macos/calendar/create-event.js";
import { calendarDeleteEventTool } from "./macos/calendar/delete-event.js";
import { messagesSendTool } from "./macos/messages/send-message.js";
import { messagesRecentTool } from "./macos/messages/recent-messages.js";

export const allTools: Tool[] = [
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  deleteFileTool,
  moveFileTool,
  copyFileTool,
  searchContentTool,
  directoryTreeTool,
  fileInfoTool,
  notionSearchTool,
  notionCreatePageTool,
  notionReadPageTool,
  notionUpdatePageTool,
  notionDeletePageTool,
  notionQueryDatabaseTool,
  notionCreateDatabaseTool,
  notionListDatabasesTool,
  notionCreateBlockTool,
  notionReadBlocksTool,
  notionUpdateBlockTool,
  notionDeleteBlockTool,
  notionAddCommentTool,
  notionListCommentsTool,
  listProcessesTool,
  cpuUsageTool,
  killProcessTool,
  systemInfoTool,
  remindersListListsTool,
  remindersListTool,
  remindersCreateTool,
  remindersCompleteTool,
  remindersDeleteTool,
  notesListFoldersTool,
  notesListTool,
  notesReadTool,
  notesSearchTool,
  notesCreateTool,
  notesDeleteTool,
  calendarListCalendarsTool,
  calendarListEventsTool,
  calendarCreateEventTool,
  calendarDeleteEventTool,
  messagesSendTool,
  messagesRecentTool,
];

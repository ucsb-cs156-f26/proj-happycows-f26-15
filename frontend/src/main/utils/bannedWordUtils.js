import { toast } from "react-toastify";

export const BANNED_WORDS_QUERY_KEY = ["/api/admin/bannedwords/all"];

export function bannedWordToAxiosParamsPost(data) {
  return {
    url: "/api/admin/bannedwords/post",
    method: "POST",
    params: {
      word: data.word,
    },
  };
}

export function onAddSuccess(bannedWord) {
  toast(`Banned word "${bannedWord.word}" added`);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/admin/bannedwords",
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}

export function onDeleteSuccess(response) {
  toast(response.message);
}

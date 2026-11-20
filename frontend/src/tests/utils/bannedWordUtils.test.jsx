import {
  BANNED_WORDS_QUERY_KEY,
  bannedWordToAxiosParamsPost,
  cellToAxiosParamsDelete,
  onAddSuccess,
  onDeleteSuccess,
} from "main/utils/bannedWordUtils";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("bannedWordUtils", () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  test("BANNED_WORDS_QUERY_KEY is the list endpoint", () => {
    expect(BANNED_WORDS_QUERY_KEY).toEqual(["/api/admin/bannedwords/all"]);
  });

  test("bannedWordToAxiosParamsPost builds the POST request", () => {
    expect(bannedWordToAxiosParamsPost({ word: "darn" })).toEqual({
      url: "/api/admin/bannedwords/post",
      method: "POST",
      params: { word: "darn" },
    });
  });

  test("onAddSuccess shows a toast with the added word", () => {
    onAddSuccess({ id: 1, word: "darn" });
    expect(mockToast).toHaveBeenCalledWith('Banned word "darn" added');
  });

  test("cellToAxiosParamsDelete builds the DELETE request", () => {
    const cell = { row: { values: { id: 7 } } };
    expect(cellToAxiosParamsDelete(cell)).toEqual({
      url: "/api/admin/bannedwords",
      method: "DELETE",
      params: { id: 7 },
    });
  });

  test("onDeleteSuccess shows the backend message in a toast", () => {
    onDeleteSuccess({ message: "BannedWord with id 7 deleted" });
    expect(mockToast).toHaveBeenCalledWith("BannedWord with id 7 deleted");
  });
});

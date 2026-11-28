import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import BannedWordForm from "main/components/BannedWords/BannedWordForm";
import BannedWordsTable from "main/components/BannedWords/BannedWordsTable";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import {
  BANNED_WORDS_QUERY_KEY,
  bannedWordToAxiosParamsPost,
  onAddSuccess,
} from "main/utils/bannedWordUtils";

export default function AdminBannedWordsPage() {
  // Stryker disable all : hard to test for query caching
  const { data: bannedWords } = useBackend(
    BANNED_WORDS_QUERY_KEY,
    { method: "GET", url: "/api/admin/bannedwords/all" },
    [],
  );
  // Stryker restore all

  const addMutation = useBackendMutation(
    bannedWordToAxiosParamsPost,
    { onSuccess: onAddSuccess },
    BANNED_WORDS_QUERY_KEY,
  );

  const onSubmit = (data) => {
    addMutation.mutate(data);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h2>Banned Words</h2>
        <p>
          Words on this list are replaced with asterisks when they are sent in
          chat.
        </p>
        <BannedWordForm submitAction={onSubmit} />
        <BannedWordsTable bannedWords={bannedWords} />
      </div>
    </BasicLayout>
  );
}

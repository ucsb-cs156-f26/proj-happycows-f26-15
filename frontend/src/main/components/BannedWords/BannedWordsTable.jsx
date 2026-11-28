import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import {
  BANNED_WORDS_QUERY_KEY,
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/bannedWordUtils";

export default function BannedWordsTable({ bannedWords }) {
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    BANNED_WORDS_QUERY_KEY,
  );

  const deleteCallback = (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "Word",
      accessor: "word",
    },
    ButtonColumn("Delete", "danger", deleteCallback, "BannedWordsTable"),
  ];

  return (
    <OurTable data={bannedWords} columns={columns} testid="BannedWordsTable" />
  );
}

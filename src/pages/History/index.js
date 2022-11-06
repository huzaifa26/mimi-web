import React, { useMemo } from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import clsx from "clsx";

import { useStore } from "../../store";
import { HistoryTable } from "../../components";
import { db } from "../../utils/firebase";
import { getPageStyles } from "../../utils/helpers";
import { ROLES } from "../../utils/constants";
import intersectionBy from "lodash/intersectionBy";

const useStyles = makeStyles((theme) => {
  return {
    ...getPageStyles(theme),
  };
});

export const History = () => {
  const classes = useStyles();

  const { state: storeState } = useStore();
  const { user } = storeState;
  const rootQuery = useMemo(
    () => db.collection("Institution").doc(user._code).collection("History"),
    [user._code]
  );

  const modifier = (list) => {
    if ([ROLES.admin, ROLES.mngr].includes(user.type)) return list;

    return list.filter((record) => {
      const { _groups, _staff } = record;

      const { group_ids, id } = user;

      return [
        intersectionBy(group_ids, _groups).length,
        intersectionBy([id], _staff).length,
      ].some((el) => !!el);
    });
  };

  return (
    <section
      className={clsx([classes.default_page_root, classes.default_page_Bg1])}
    >
      <HistoryTable rootQuery={rootQuery} modifier={modifier} />
    </section>
  );
};

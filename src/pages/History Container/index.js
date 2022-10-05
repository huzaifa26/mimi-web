import { TableCell, Typography, makeStyles } from "@material-ui/core";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import {
  Loader,
  SimpleModal,
  SearchBar,
  MenuSingle,
  Links,
  DataTable,
} from "../../components";
import { FormattedMessage } from "react-intl";
import { useStore } from "../../store";
import { HISTORY_TYPES } from "../../utils/constants";
import { FirebaseHelpers } from "../../utils/helpers";

import { usePagination } from "../../hooks/usePaginaton";
// import { db } from "../../utils/firebase";

import * as Modals from "./modals";
import {
  getSectionHeaderStyles,
  getTypographyStyles,
  searchBy,
} from "../../utils/helpers";

const headers = [
  {
    id: `date`,
  },
  {
    id: `group`,
  },
  {
    id: `excecuter`,
  },
  {
    id: `executed_by`,
  },
  {
    id: `action`,
  },
  {
    id: `amount`,
  },
];

const options = [
  {
    id: "month",
    label: "This Month",
  },
  {
    id: "year",
    label: "This Year",
  },
  {
    id: "week",
    label: "This Week",
  },
];

const ModalMappings = [
  {
    type: HISTORY_TYPES.Buy_Coupon,
    modal: Modals.BuyVoucherBody,
    id: <FormattedMessage id={"buy_coupon"} />,
  },
  {
    type: HISTORY_TYPES.Grant_Group_Coupon,
    modal: Modals.GroupGrantCouponBody,
    id: <FormattedMessage id={"grant_group_coupon"} />,
  },
  {
    type: HISTORY_TYPES.Coupon_Data,
    modal: Modals.BoardingCouponBody,
    id: <FormattedMessage id={"boarding_school_coupons"} />,
  },
  {
    type: HISTORY_TYPES.Daily_Report,
    modal: Modals.DailyScoreBody,
    id: <FormattedMessage id={"daily_score"} />,
  },
  {
    type: HISTORY_TYPES.EXP_Data,
    modal: Modals.BoardingExpBody,
    id: <FormattedMessage id={"boarding_school_EXP"} />,
  },
  {
    type: HISTORY_TYPES.Grant_Group_Score,
    modal: Modals.GroupGrantScoreBody,
    id: <FormattedMessage id={"grant_score"} />,
  },
  {
    type: HISTORY_TYPES.Grant_Kid_Score,
    modal: Modals.KidGrantBody,
    id: <FormattedMessage id={"grant_score"} />,
  },
  {
    type: HISTORY_TYPES.Grant_Score_Data,
    modal: Modals.BoardingGrantScoreBody,
    id: <FormattedMessage id={"boarding_school_grant_score"} />,
  },
  {
    type: HISTORY_TYPES.Profile_Pic_Permission_Data,
    modal: Modals.BoardingPermissionBody,
    id: <FormattedMessage id={"boarding_school_profile_permission"} />,
  },
  {
    type: HISTORY_TYPES.Redeem_Coupon,
    modal: Modals.RedeemCouponBody,
    id: <FormattedMessage id={"redeem_coupon"} />,
  },
  {
    type: HISTORY_TYPES.Update_Group_Score,
    modal: Modals.GroupUpdateScoreBody,
    id: <FormattedMessage id={"update_score"} />,
  },
  {
    type: HISTORY_TYPES.Update_Score_Data,
    modal: Modals.BoardingUpdateScoreBody,
    id: <FormattedMessage id={"boarding_school_update_score"} />,
  },
  {
    type: HISTORY_TYPES.Update_Kid_Score,
    modal: Modals.KidUpdateBody,
    id: <FormattedMessage id={"update_score"} />,
  },
  {
    type: HISTORY_TYPES.Refund_Coupon,
    modal: Modals.RefundCouponBody,
    id: <FormattedMessage id={"refund_coupon"} />,
  },
];

// const fetchDetails = async (record, params) => {
//   const { code } = params;

//   const _record = { ...record };

//   if (record.groupId) {
//     const _group = (
//       await db
//         .collection("Institution")
//         .doc(code)
//         .collection("groups")
//         .doc(record.groupId)
//         .get()
//     ).data();
//     _record._group = _group;
//   }
//   if (record.kidId || record.kid) {
//     const _kid = (
//       await db
//         .collection("Institution")
//         .doc(code)
//         .collection("kid")
//         .doc(record.kidId || record.kid)
//         .get()
//     ).data();
//     _record._kid = _kid;
//   }
//   if (record.executerId) {
//     const _staff = (
//       await db
//         .collection("Institution")
//         .doc(code)
//         .collection("staff")
//         .doc(record.executerId)
//         .get()
//     ).data();
//     _record._staff = _staff;
//   }
//   // list
//   if (record.kids) {
//     let docs = [];
//     for await (const kidId of record.kids) {
//       docs.push(
//         (
//           await db
//             .collection("Institution")
//             .doc(code)
//             .collection("kid")
//             .doc(kidId)
//             .get()
//         ).data()
//       );
//     }
//     _record._kids = docs;
//   }
//   if (record.groups) {
//     let docs = [];
//     for await (const groupId of record.groups) {
//       docs.push(
//         (
//           await db
//             .collection("Institution")
//             .doc(code)
//             .collection("groups")
//             .doc(groupId)
//             .get()
//         ).data()
//       );
//     }
//     _record._groups = docs;
//   }

//   if (record.couponList) {
//     let docs = [];
//     for await (const store of record.couponList) {
//       docs.push(
//         (
//           await db
//             .collection("Institution")
//             .doc(code)
//             .collection("store")
//             .doc(store.storeId)
//             .collection("products")
//             .doc(store.productId)
//             .get()
//         ).data()
//       );
//     }
//     _record._products = docs;
//   }

//   return _record;
// };

// const renderExecutor = (record) => {
//   const { _kid, _staff, _group, _groups, _kids } = record;

//   if (_kids) {
//     if (_kids.length > 1) {
//       return `${_kids.length} Kids`;
//     } else {
//       return `${_kids[0].name}`;
//     }
//   }

//   if (_kid) {
//     return `${_kid.name} `;
//   }

//   if (_group) {
//     return `${_group.name} `;
//   }
// };

export const HistoryTable = ({ rootQuery, hideTitle, modifier }) => {
  useEffect(() => {
    (async () => {
      const _groups = await FirebaseHelpers.fetchGroups.execute({ user });
      setGroups(_groups);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const _kids = await FirebaseHelpers.fetchKids.execute({ user });
      setKids(_kids);
    })();
  }, []);

  const classes = useStyles();

  const { state: storeState } = useStore();
  const { user, orientation } = storeState;

  const [modalStates, setModalStates] = useState(() => {
    return Object.keys(HISTORY_TYPES).reduce((acc, el) => {
      acc[el] = false;
      return acc;
    }, {});
  });

  const modalRef = useRef();
  const [selectedRow, setSelectedRow] = useState();
  const [groups, setGroups] = useState();
  const [kids, setKids] = useState();
  const [searchText, setSearchText] = useState("");
  const [duration, setDuration] = useState({
    id: "month",
    label: "This Month",
  });

  const [history, setHistory] = useState([]);

  const query = useMemo(() => {
    return rootQuery
      .orderBy("time")
      .where("time", ">", moment().startOf(duration.id).toDate())
      .where("time", "<", moment().endOf(duration.id).toDate());
  }, [duration, rootQuery]);

  const { data, loading, loadMore } = usePagination(query, modifier, (list) => {
    return list.sort(
      (a, b) => b.time.toDate().getTime() - a.time.toDate().getTime()
    );
  });

  const renderItem = (row) => {
    const key = String(row.type).replaceAll(" ", "_");
    return (
      <Fragment>
        <TableCell>
          <Typography>
            {moment(row.time?.toDate()).format("DD-MM-YYYY")}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography>
            {row?._groups?.length == 1 &&
              groups
                .filter((el) => el.id == row._groups[0])
                .map((filteredName) => filteredName.name)}
            {row?._groups?.length > 1 && row?._groups?.length + " Groups"}
            {!row?._groups && row.payload.kid.groupName}
          </Typography>
        </TableCell>
        <TableCell className={classes.default_typography_capitalize}>
          {row.executer}
        </TableCell>
        <TableCell className={classes.default_typography_capitalize}>
          {row.executedBy}
        </TableCell>
        <TableCell
          onClick={() => {
            setSelectedRow(row);
            setModalStates((prev) => {
              return { ...prev, [key]: true };
            });
            modalRef.current = key;
          }}
        >
          <Typography>{row.type}</Typography>
        </TableCell>
        <TableCell>
          <Typography>
            {row.payload?.score
              ? row.payload.score
              : row.payload?.status
              ? "True"
              : "False"}
          </Typography>
        </TableCell>
      </Fragment>
    );
  };

  const handleClose = (key) => {
    setModalStates((prev) => {
      return { ...prev, [key]: false };
    });
    setSelectedRow(null);
    modalRef.current = null;
  };

  useEffect(() => {
    if (searchText) {
      setHistory(
        searchBy(
          data,
          [
            "type",
            "payload=>kid=>name",
            "payload=>kids=>name",
            "payload=>kid=>groupName",
            "payload=>kids=>groupName",
            "payload=>group=>name",
            "payload=>groups=>name",
            "payload=>coupon=>name",
            "payload=>coupon=>store=>name",
            "payload=>coupons=>name",
            "payload=>coupons=>store=>name",
            "executedBy",
            "executer",
          ],
          searchText
        )
      );
    } else {
      setHistory(data);
    }
  }, [searchText, data]);

  const renderLabel = (duration) => {
    if (duration) {
      return (
        <Fragment>
          <span className={classes.label}>Show:</span> {duration.label}
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <span className={classes.label}>Show:</span> none
        </Fragment>
      );
    }
  };

  const links = [
    {
      ref: "/history",
      title: <FormattedMessage id="history" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      {!hideTitle && (
        <div className={classes.default_headerSection_pageTitle}>
          <Links links={links} />
        </div>
      )}

      <div
        style={{
          flex: 1,
        }}
      >
        <SearchBar
          placeholder={`Search by names`}
          size={"small"}
          handleSearch={(value) => setSearchText(value)}
        />
      </div>
      <div className={classes.default_headerSection_actionsContainer}>
        <MenuSingle
          list={options}
          label={renderLabel(duration)}
          handleChange={(value) => setDuration(value)}
          defaultValue={duration}
        />
      </div>
    </div>
  );

  const tableProps = {
    data: history,
    renderItem,
    headers,
    loadMore,
    handleRowClick: (row) => {
      const key = String(row.type).replaceAll(" ", "_");

      setSelectedRow(row);
      setModalStates((prev) => {
        return { ...prev, [key]: true };
      });
      modalRef.current = key;
    },
  };

  return loading ? (
    <Loader />
  ) : (
    <Fragment>
      {ModalMappings.map((el) => {
        const Component = el.modal;

        return (
          <SimpleModal
            title={el.id}
            open={modalStates[el.type]}
            handleClose={() => handleClose(el.type)}
          >
            <Component
              data={selectedRow}
              handleClose={() => handleClose(el.type)}
            />
          </SimpleModal>
        );
      })}
      {actionBar}

      <DataTable {...tableProps} />
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => {
  return { ...getSectionHeaderStyles(theme), ...getTypographyStyles(theme) };
});

import {
  Grid,
  makeStyles,
  TableCell,
  Typography,
  Box,
} from "@material-ui/core";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Button,
  SearchBar,
  Cockpit,
  SimpleModal,
  DataTable,
  Loader,
} from "../../../components";
import Icons, {
  AddIconSim,
  Delete,
  Pause,
  Active,
  FileIcon,
} from "../../../components/Icons";
import * as XLSX from "xlsx";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import Edit from "../../../assets/icons/EditIcon.png";
import {
  getModalStyles,
  getTypographyStyles,
  getSectionHeaderStyles,
  searchBy,
} from "../../../utils/helpers";
import { PERMISSIONS } from "../../../utils/constants";
import Key from "../../../assets/icons/key.png";
import clsx from "clsx";
import moment from "moment";

import { CreatePrizeBody } from "./createPrize";
import { ChangeDateBody } from "./changeDate";
import { EligibleKidsBody } from "./eligibleKids";
import { ManageAccessBody } from "./manageAccess";
import { nanoid } from "nanoid";

const useStyles = makeStyles((theme) => {
  return {
    ...getTypographyStyles(theme),
    ...getSectionHeaderStyles(theme),
    ...getModalStyles(theme),
    deleteButton: {
      background: `#FF4031 !important`,
    },
    active: {
      color: `#4FBF67`,
    },
    disabled: {
      color: `#FF4031`,
    },
    routeSectionContainer: {
      marginBottom: 20,
    },
    routeSectionLabel: {
      fontSize: 12,
      color: "#8F92A1",
      fontWeight: 400,
    },
    routeSectionHeading: {
      fontSize: 22,
      fontWeight: 600,
    },
  };
});

const headers = [
  {
    id: `name`,
  },
  {
    id: `eligibles`,
  },
  {
    id: `required_level`,
  },
  {
    id: `action`,
  },
];

export const RouteDetailsBody = (props) => {
  const { handleClose, routePlanId } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;

  const [isHover, setIsHover] = useState();
  const [searchText, setSearchText] = useState("");
  const listenerRef = useRef([]);

  const [routePlan, setRoutePlan] = useState();
  const [data, setData] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [eligibleKids, setEligibleKids] = useState([]);

  const [modalStates, setModalStates] = useState({
    createPrize: false,
    manageAccess: false,
    changeStartDate: false,
    changeEndDate: false,
    eligibleKids: false,
  });

  const routeLog = useRef(null);

  useEffect(() => {
    if(routeLog?.current !== null)
      console.log("route " + routeLog?.current?.name + " opened, uid:" + user.id);
  }, [routeLog.current]);

  useEffect(() => {
    if (!routePlanId) return;
    listenerRef.current.push(
      db
        .collection("Institution")
        .doc(user._code)
        .collection("routePlan")
        .doc(routePlanId)
        .onSnapshot((snapshot) => {
          setRoutePlan(snapshot.data());
          routeLog.current = snapshot.data();
        })
    );

    return () => {
      listenerRef.current.length && listenerRef.current.forEach((el) => el());
    };
  }, [routePlanId]);

  useEffect(() => {
    if (!routePlan?.id) return;

    listenerRef.current.push(
      db
        .collection("Institution")
        .doc(user._code)
        .collection("routePlan")
        .doc(routePlan.id)
        .collection("prizes")
        .orderBy("requiredLevel")
        .onSnapshot(async (snapshot) => {
          const routePlanKids = routePlan.kids.length
            ? (
                await db
                  .collection("Institution")
                  .doc(user._code)
                  .collection("kid")
                  .get()
              ).docs
                .map((el) => el.data())
                .filter((el) => routePlan.kids.includes(el.id))
            : [];

          const levelsForPrizes = snapshot.docs
            .map((el) => el.data().requiredLevel)
            .sort();


          setData(
            snapshot.docs.map((el) => {
              const _prize = el.data();
              return {
                ..._prize,
                eligibleKids: routePlanKids.filter((kid) => {
                  let start;

                  levelsForPrizes.forEach((level) => {
                    if (kid.level >= level) start = level;
                  });

                  return _prize.requiredLevel === start;
                }),
              };
            })
          );
        })
    );
  }, [routePlan?.id]);

  useEffect(() => {
    if (searchText) {
      setPrizes(searchBy(data, ["name"], searchText));
    } else {
      setPrizes(data);
    }
  }, [searchText, data]);

  const closeCreatePrize = () => {
    setModalStates((prev) => ({ ...prev, createPrize: false }));
  };

  const closeStartDate = () => {
    setModalStates((prev) => ({ ...prev, changeStartDate: false }));
  };
  const closeEndDate = () => {
    setModalStates((prev) => ({ ...prev, changeEndDate: false }));
  };
  const closeManageAccess = () => {
    setModalStates((prev) => ({ ...prev, manageAccess: false }));
  };
  const closeEligibleKids = () => {
    setModalStates((prev) => ({ ...prev, eligibleKids: false }));
    setEligibleKids([]);
  };

  const deletePrize = async (prize) => {
    if (!user.permissions[PERMISSIONS.trackAccess]) {
      return actions.alert(<FormattedMessage id="access_denied"/>);
    }

    const action = async () => {
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("routePlan")
        .doc(routePlan.id)
        .collection("prizes")
        .doc(prize.id)
        .delete();
    };

    actions.showDialog({
      action,
      // title: `Delete ${prize.name}?`,
      title: <FormattedMessage id="delete_heading" defaultMessage="Delete {name}?" values={{name:prize.name}}/>,
      body: <FormattedMessage id="delete_message"/>,
    });
  };

  const deleteRoutePlan = async () => {
    if (!user.permissions[PERMISSIONS.trackAccess]) {
      return actions.alert(<FormattedMessage id="access_denied"/>);
    }

    const action = async () => {
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("routePlan")
        .doc(routePlan.id)
        .delete();
      handleClose();
    };

    actions.showDialog({
      action,
      // title: `Delete ${routePlan.name}?`,
      title: <FormattedMessage id="delete_heading" defaultMessage="Delete {name}?" values={{name:routePlan.name}}/>,
      body: <FormattedMessage id="delete_message"/>,
    });
  };

  const handleStatus = async () => {
    if (!user.permissions[PERMISSIONS.trackAccess]) {
      return actions.alert(<FormattedMessage id="access_denied"/>);
    }

    await db
      .collection("Institution")
      .doc(user._code)
      .collection("routePlan")
      .doc(routePlan.id)
      .update({
        status: !routePlan.status,
      });
  };
  const handleGenEligibleKidsFile = async (data) => {
    return new Promise((resolve, reject) => {
      // var prizeName = data.map((e)=>{
      //    return  [e.name, e.requiredLevel, ...e.eligibleKids.map(el=>el.groupName), ...e.eligibleKids.map(el=>el.name) ]
      // })
      var prizeName = data.map((e) => {
        return {
          prizeName: e.name,
          level: e.requiredLevel,
          groups: `${[...e.eligibleKids.map((el) => el.groupName)]}`,
          kids: `${[...e.eligibleKids.map((el) => el.name)]}`,
        };
      });

      resolve(prizeName);
    }).then((rows) => {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
      XLSX.utils.sheet_add_aoa(
        worksheet,
        [["Prize Name", "Level", "Groups", "Kids"]],
        { origin: "A1" }
      );
      const max_widthA = rows.reduce(
        (w, r) => Math.max(w, r.prizeName.length),
        10
      );
      const max_widthB = rows.reduce((w, r) => Math.max(w, r.level.length), 10);
      const max_widthC = rows.reduce(
        (w, r) => Math.max(w, r.groups.length),
        10
      );
      const max_widthD = rows.reduce((w, r) => Math.max(w, r.kids.length), 10);

      worksheet["!cols"] = [
        { wch: max_widthA },
        { wch: max_widthB },
        { wch: max_widthC },
        { wch: max_widthD },
      ];
      return XLSX.writeFile(workbook, "EligibleKids.xlsx", {
        compression: true,
      });
    });
  };

  const renderStatus = (status) => {
    if (status) {
      return (
        <Typography
          className={clsx(
            classes.default_typography_subHeading,
            classes.default_typography_colorSuccess,
            classes.default_typography_bold,
            classes.default_typography_capitalize
          )}
        >
          <FormattedMessage id={"active"} />
        </Typography>
      );
    } else {
      return (
        <Typography
          className={clsx([
            classes.default_typography_subHeading,
            classes.default_typography_colorFailure,
            classes.default_typography_bold,
            classes.default_typography_capitalize,
          ])}
        >
          <FormattedMessage id={"disabled"} />
        </Typography>
      );
    }
  };

  const renderItem = (prize) => {
    return (
      <Fragment>
        <TableCell>{prize.name}</TableCell>
        <TableCell
          style={{
            cursor: "pointer",
          }}
          onClick={() => {
            setEligibleKids(prize.eligibleKids);
            setModalStates((prev) => ({ ...prev, eligibleKids: true }));
          }}
        >
          {prize.eligibleKids.length}
        </TableCell>
        <TableCell>{prize.requiredLevel}</TableCell>
        <TableCell>
          <Delete
            style={{ color: "#8F92A1", cursor: "pointer" }}
            onClick={() => deletePrize(prize)}
          />
        </TableCell>
      </Fragment>
    );
  };

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div
        style={{
          flex: 1,
        }}
      >
        <SearchBar
          placeholder={"search_by_names"}
          size={"small"}
          handleSearch={(value) => setSearchText(value)}
        />
      </div>
      <div className={classes.default_headerSection_actionsContainer}>
        <Button
          startIcon={<img src={Key} />}
          onClick={() => {
            setModalStates((prev) => ({ ...prev, manageAccess: true }));
          }}
        >
          <FormattedMessage id="manage_access" />
        </Button>
        <Button
          startIcon={<AddIconSim style={{ fontSize: 22 }} />}
          onClick={() => {
            setModalStates((prev) => ({ ...prev, createPrize: true }));
          }}
        >
          <FormattedMessage id="add_prize" />
        </Button>
        <Button
          startIcon={<FileIcon style={{ fontSize: 22 }} />}
          onClick={() => {
            handleGenEligibleKidsFile(data);
          }}
        >
          <FormattedMessage id="Generate File" />
        </Button>
      </div>
    </div>
  );

  const tableProps = {
    data: prizes,
    renderItem,
    headers,
    loadMore: null,
  };

  if (!routePlan) return <Loader />;

  return (
    <Fragment>
      <SimpleModal
        extended
        title={<FormattedMessage id="manage_access" />}
        open={modalStates.manageAccess}
        handleClose={closeManageAccess}
      >
        <ManageAccessBody
          routePlan={routePlan}
          handleClose={closeManageAccess}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="add_prize" />}
        open={modalStates.createPrize}
        handleClose={closeCreatePrize}
      >
        <CreatePrizeBody
          prizes={prizes}
          routePlan={routePlan}
          handleClose={closeCreatePrize}
        />
      </SimpleModal>
      <SimpleModal
        title={<FormattedMessage id="eligibles" />}
        open={modalStates.eligibleKids}
        handleClose={closeEligibleKids}
      >
        <EligibleKidsBody kids={eligibleKids} handleClose={closeEligibleKids} />
      </SimpleModal>

      <SimpleModal
        title={<FormattedMessage id="change_date" />}
        open={modalStates.changeStartDate}
        handleClose={closeStartDate}
      >
        <ChangeDateBody
          defaultDate={routePlan.startingDate.toDate()}
          routePlan={routePlan}
          handleClose={closeStartDate}
          setter={(date) => {
            return db
              .collection("Institution")
              .doc(user._code)
              .collection("routePlan")
              .doc(routePlan.id)
              .update({
                startingDate: date,
              });
          }}
        />
      </SimpleModal>

      <SimpleModal
        title={<FormattedMessage id="change_date" />}
        open={modalStates.changeEndDate}
        handleClose={closeEndDate}
      >
        <ChangeDateBody
          defaultDate={routePlan.endingDate.toDate()}
          handleClose={closeEndDate}
          condition={routePlan.startingDate.toDate()}
          setter={(date) => {
            return db
              .collection("Institution")
              .doc(user._code)
              .collection("routePlan")
              .doc(routePlan.id)
              .update({
                endingDate: date,
              });
          }}
        />
      </SimpleModal>

      <Grid container>
        <Grid item md={3} xs={6}>
          <Typography
            className={clsx(
              classes.default_typography_label,
              classes.default_typography_colorLight,
              classes.default_typography_bold
            )}
          >
            <FormattedMessage id="ROUTE_NAME" />
          </Typography>
          <Typography
            className={clsx(
              classes.default_typography_subHeading,
              classes.default_typography_colorDark,
              classes.default_typography_bold,
              classes.default_typography_capitalize
            )}
          >
            {routePlan.name}
          </Typography>
        </Grid>
        <Grid item md={3} xs={6}>
          <Typography
            className={clsx(
              classes.default_typography_label,
              classes.default_typography_colorLight,
              classes.default_typography_bold
            )}
          >
            <FormattedMessage id="STATUS" />
          </Typography>
          {renderStatus(routePlan.status)}
        </Grid>
        <Grid item md={3} xs={6}>
          <Typography
            className={clsx(
              classes.default_typography_label,
              classes.default_typography_colorLight,
              classes.default_typography_bold
            )}
          >
            <FormattedMessage id="STARTING_DATE" />
            <Box
              component={"img"}
              marginX={1}
              src={Edit}
              style={{ cursor: "pointer", color: isHover ? "blue" : null }}
              onMouseEnter={() => {
                setIsHover(true);
              }}
              onMouseLeave={() => {
                setIsHover(false);
              }}
              onClick={() => {
                if (!user.permissions[PERMISSIONS.trackAccess]) {
                  return actions.alert(
                    <FormattedMessage id="access_denied"/>
                  );
                } else {
                  setModalStates((prev) => ({
                    ...prev,
                    changeStartDate: true,
                  }));
                }
              }}
            />
          </Typography>
          <Typography
            className={clsx(
              classes.default_typography_subHeading,
              classes.default_typography_colorDark,
              classes.default_typography_bold,
              classes.default_typography_capitalize
            )}
          >
            {moment(routePlan.startingDate?.toDate()).format("DD-MM-YYYY")}
          </Typography>
        </Grid>
        <Grid item md={3} xs={6}>
          <Typography
            className={clsx(
              classes.default_typography_label,
              classes.default_typography_colorLight,
              classes.default_typography_bold
            )}
          >
            <FormattedMessage id="ENDING_DATE" />

            <Box
              component={"img"}
              marginX={1}
              src={Edit}
              style={{ cursor: "pointer", color: isHover ? "blue" : null }}
              onMouseEnter={() => {
                setIsHover(true);
              }}
              onMouseLeave={() => {
                setIsHover(false);
              }}
              onClick={() => {
                if (!user.permissions[PERMISSIONS.trackAccess]) {
                  return actions.alert(
                    <FormattedMessage id="access_denied"/>
                  );
                } else {
                  setModalStates((prev) => ({ ...prev, changeEndDate: true }));
                }
              }}
            />
          </Typography>
          <Typography
            className={clsx(
              classes.default_typography_subHeading,
              classes.default_typography_colorDark,
              classes.default_typography_bold,
              classes.default_typography_capitalize
            )}
          >
            {moment(routePlan.endingDate.toDate()).format("DD-MM-YYYY")}
          </Typography>
        </Grid>
      </Grid>

      {actionBar}

      <DataTable {...tableProps} />

      <div className={classes.default_modal_footer}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4} justifyContent="center">
            <Button
              fullWidth
              className={classes.default_modal_buttonSecondary}
              onClick={handleClose}
            >
              <FormattedMessage id="cancel" />
            </Button>
          </Grid>
          <Grid item xs={12} sm={4} justifyContent="center">
            {routePlan.status ? (
              <Button
                startIcon={<Pause />}
                fullWidth
                className={classes.default_modal_buttonSecondary}
                onClick={handleStatus}
              >
                <FormattedMessage id="disable_route" />
              </Button>
            ) : (
              <Button
                startIcon={<Active />}
                fullWidth
                className={classes.default_modal_buttonSecondary}
                onClick={handleStatus}
              >
                <FormattedMessage id="activate_route" />
              </Button>
            )}
          </Grid>
          <Grid item xs={12} sm={4} justifyContent="center">
            <Button
              fullWidth
              startIcon={<Delete />}
              className={classes.deleteButton}
              onClick={deleteRoutePlan}
            >
              <FormattedMessage id="delete_route" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};
import {
  Avatar,
  Checkbox,
  Grid,
  makeStyles,
  TableCell,
  Typography,
} from "@material-ui/core";
import { nanoid } from "nanoid";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Button,
  DataTable,
  MenuMultiple,
  SearchBar,
} from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import {
  getModalStyles,
  getSectionHeaderStyles,
  searchBy,
} from "../../../utils/helpers";

const useStyles = makeStyles((theme) => {
  return { ...getModalStyles(theme), ...getSectionHeaderStyles(theme) };
});

export const AddKidBody = (props) => {
  const { handleClose } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { user, defaultAvatars } = storeState;

  const [state, setState] = useState({
    kids: [],
    searchedKids: [],
    filteredKids: [],
    selectedKids: [],
    options: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const selectedKidsIds = state.selectedKids.map((el) => el.id);

  const headers = useMemo(
    () => [
      {
        id: ` `,
      },
      {
        id: `KID_NAME`,
      },
      {
        id: `GROUP`,
      },
    ],
    []
  );

  useEffect(() => {
    (async () => {
      const _kids = (
        await db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .where("has_special_program", "==", false)
          .get()
      ).docs.map((el) => el.data());
      setState((prev) => ({ ...prev, kids: _kids, filteredKids: _kids }));
    })();
  }, []);

  useEffect(() => {
    if (!state.kids.length) return;

    const validGroups = Object.entries(
      state.kids.reduce((acc, el) => {
        const { groupId, groupName } = el;

        if (!acc[groupId]) acc[groupId] = groupName;

        return acc;
      }, {})
    ).map((el) => {
      const [id, name] = el;
      return {
        id,
        name,
        label: name,
        groupId: id,
      };
    });

    setState((prev) => ({ ...prev, options: validGroups }));
  }, [state.kids]);

  useEffect(() => {
    if (searchText) {
      setState((prev) => ({
        ...prev,
        searchedKids: searchBy(prev.filteredKids, ["name"], searchText),
      }));
    } else {
      setState((prev) => ({ ...prev, searchedKids: prev.filteredKids }));
    }
  }, [searchText, state.filteredKids]);

  const handleChange = (kid) => {
    const exists = state.selectedKids.find((el) => el.id === kid.id);

    if (exists) {
      setState((prev) => ({
        ...prev,
        selectedKids: prev.selectedKids.filter((el) => el.id !== kid.id),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedKids: [...prev.selectedKids, kid],
      }));
    }
  };

  const renderItem = (kid) => {
    return (
      <Fragment>
        <TableCell>
          <Checkbox
            style={{
              color: "#685BE7",
            }}
            disableRipple
            onChange={() => handleChange(kid)}
            checked={selectedKidsIds.includes(kid.id)}
          />
        </TableCell>
        <TableCell className={classes.cell}>
          <div>
            <Avatar
              style={{
                marginRight: 12,
              }}
              src={kid.image || defaultAvatars?.kid}
            />
            <Typography>{kid.name}</Typography>
          </div>
        </TableCell>
        <TableCell>{kid.groupName}</TableCell>
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
          placeholder={`Search by names`}
          size={"small"}
          handleSearch={(value) => setSearchText(value)}
        />
      </div>
      <div className={classes.default_headerSection_actionsContainer}>
        <MenuMultiple
          list={state.options}
          entity={"Groups"}
          handleChange={(options) => {
            const groupIds = options.map((el) => el.id);
            setState((prev) => ({
              ...prev,
              filteredKids: state.kids.filter((el) =>
                groupIds.includes(el.groupId)
              ),
            }));
          }}
        />
      </div>
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true);

    await Promise.all(
      state.selectedKids.map(async (kid) => {
        const batch = db.batch();
        const ref = db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(kid.id);
        batch.update(ref, {
          has_special_program: true,
        });

        const reportTempaltes = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .doc(kid.groupId)
            .collection("report_templates")
            .get()
        ).docs.map((el) => el.data());

        const level_id = nanoid(6);

        batch.set(
          db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kid.id)
            .collection("levels")
            .doc(level_id),
          {
            id: level_id,
            level: 0,
            startDate: new Date(),
            endDate: "",
            currentLevel: true,
          }
        );

        reportTempaltes.forEach((el) => {
          batch.set(
            db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid.id)
              .collection("levels")
              .doc(level_id)
              .collection("subjects")
              .doc(el.id),
            {
              ...el,
            }
          );
        });

        reportTempaltes.forEach((el) => {
          batch.set(
            db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid.id)
              .collection("achievements")
              .doc(el.id),
            {
              redPoints: 0,
              streak: 0,
              subjectName: el.name,
              isDeleted: true,
              subject_id: el.id,
            }
          );
        });

        await batch.commit();
      })
    );

    setLoading(false);
    handleClose();
  };

  const tableProps = {
    data: state.searchedKids,
    renderItem,
    headers,
    loadMore: null,
  };

  return (
    <Fragment>
      {actionBar}
      <DataTable {...tableProps} />

      <div className={classes.default_modal_footer}>
        <Grid container spacing={2}>
          <Grid item xs={6} justifyContent="center">
            <Button
              fullWidth
              disable={loading}
              className={classes.default_modal_buttonSecondary}
              onClick={handleClose}
            >
              <FormattedMessage id="cancel" />
            </Button>
          </Grid>
          <Grid item xs={6} justifyContent="center">
            <Button
              loading={loading}
              fullWidth
              disable={loading}
              onClick={handleSubmit}
            >
              <FormattedMessage id="add" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};

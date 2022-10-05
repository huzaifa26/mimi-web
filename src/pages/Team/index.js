import firebase from "firebase/app";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  TableCell,
  Typography,
  makeStyles,
  Box,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import {
  AddIcon,
  Cockpit,
  SearchBar,
  Button,
  Loader,
  SimpleModal,
  Links,
  DataTable,
  MenuMultiple,
} from "../../components";
import { db } from "../../utils/firebase";
import { useStore } from "../../store";
import { usePagination } from "../../hooks/usePaginaton";
import Star from "../../assets/icons/starIcon.png";
import StarOut from "../../assets/icons/starOutlinned.png";
import {
  FirebaseHelpers,
  getPageStyles,
  getSectionHeaderStyles,
  sortByFavorite,
  stopEventBubble,
  searchBy,
  getTypographyStyles,
} from "../../utils/helpers";
import { RoleMappings, ROLES } from "../../utils/constants";
import { ProfileBody } from "./modals/profile";
import { AddSchoolBody } from "./modals/addSchool";

import clsx from "clsx";
import intersectionBy from "lodash/intersectionBy";

const headers = [
  {
    id: `staff_name`,
  },
  {
    id: `group_name`,
  },
  {
    id: `role`,
  },
];

const options = [
  {
    id: ROLES.admin,
    name: <FormattedMessage id={"admin"} />,
  },
  {
    id: ROLES.mngr,
    name: <FormattedMessage id={"manager"} />,
  },
  {
    id: ROLES.crdntr,
    name: <FormattedMessage id={"coordinator"} />,
  },
  {
    id: ROLES.guide,
    name: <FormattedMessage id={"guide"} />,
  },
  {
    id: ROLES.gStaff,
    name: <FormattedMessage id={"general_staff"} />,
  },
];

export const Team = React.memo(() => {
  const history = useHistory();
  const classes = useStyles();

  const { state: storeState } = useStore();
  const { user, orientation, defaultAvatars } = storeState;

  const intl = useIntl();

  const query = useMemo(
    () =>
      FirebaseHelpers.fetchStaff
        .query({ user })
        .orderBy("id")
        .where("id", "!=", user.id),
    []
  );
  // .where('group_ids', 'array-contains-any', user.group_ids);

  const modifier = useMemo(
    () => async (list) => {
      console.log("this is staff list", {
        list,
      });
      if (
        user.type == ROLES.crdntr ||
        user.type == ROLES.gStaff ||
        user.type == ROLES.mngr
      ) {
        let _arr = [];
        // list = list.filter((e)=>e.group_ids.includes(user.group_ids))
        list = list.map((e) => {
          user.group_ids.map((el) => {
            if (e.group_ids.includes(el)) {
              _arr.push(e);
            }
          });
        });
        console.log({ filteredList: _arr });
        list = _arr;
      }
      const temp = [];
      for (const staff of list) {
        const _staff = { ...staff };

        const canAccessKids = [ROLES.gStaff].includes(_staff.type);

        if (canAccessKids) {
          if (_staff.kids_access.length === 1) {
            _staff._groups = `1 ${intl.formatMessage({ id: "group" })}`;
          } else {
            if (!_staff.kids_access?.length) {
              _staff._groups = intl.formatMessage({ id: "no_groups" });
            } else {
              _staff._groups = `${
                _staff.kids_access.length
              } ${intl.formatMessage({ id: "groups" })}`;
            }
          }
        } else {
          if (_staff.group_ids.length === 1) {
            const [groupId] = _staff.group_ids;
            const _group = (
              await db
                .collection("Institution")
                .doc(user._code)
                .collection("groups")
                .doc(groupId)
                .get()
            ).data();

            _staff._groups = _group.name;
          } else {
            if (!_staff.group_ids?.length) {
              _staff._groups = intl.formatMessage({ id: "no_groups" });
            } else {
              _staff._groups = `${_staff.group_ids.length} ${intl.formatMessage(
                { id: "groups" }
              )}`;
            }
          }
        }

        temp.push(_staff);
      }

      return temp;
    },
    []
  );

  const { data, loading, loadMore } = usePagination(query, modifier, (list) =>
    sortByFavorite(list, user.id)
  );
  const [searchText, setSearchText] = useState("");
  const [profileModalShow, setProfileModalShow] = useState(false);
  const [addSchoolShow, setAddSchoolShow] = useState(false);

  const [state, setState] = useState({
    filteredTeam: [],
    searchedTeam: [],
    selectedStaff: null,
    roleOptions: [],
    groupOptions: [],
    selectedRoles: [],
    selectedGroups: [],
  });

  useEffect(() => {
    (async () => {
      if (!data.length) return;
      let roles = new Set();
      let groups = new Set();

      data.forEach((el) => {
        roles.add(el.type);
        groups = new Set([...groups, ...el.group_ids]);
      });

      roles = options.filter((el) => [...roles].includes(el.id));
      groups = (
        await Promise.all(
          [...groups].map((groupId) =>
            db
              .collection("Institution")
              .doc(user._code)
              .collection("groups")
              .doc(groupId)
              .get()
          )
        )
      ).map((el) => {
        const group = el.data();

        return {
          label: group.name,
          name: group.name,
          id: group.id,
        };
      });

      setState((prev) => ({
        ...prev,
        roleOptions: roles,
        groupOptions: groups,
      }));
    })();
  }, [data]);

  useEffect(() => {
    if (!data.length) return;

    const selectedRolesId = state.selectedRoles.map((el) => el.id);
    const selectedGroupsId = state.selectedGroups.map((el) => el.id);

    const _filteredTeam = data.filter((el) => {
      if (el.group_ids.length)
        return (
          selectedRolesId.includes(el.type) &&
          intersectionBy(selectedGroupsId, el.group_ids).length
        );

      return selectedRolesId.includes(el.type);
    });

    setState((prev) => ({ ...prev, filteredTeam: _filteredTeam }));
  }, [data, state.selectedRoles, state.selectedGroups]);

  useEffect(() => {
    if (searchText) {
      setState((prev) => ({
        ...prev,
        searchedTeam: searchBy(state.filteredTeam, ["name"], searchText),
      }));
    } else {
      setState((prev) => ({ ...prev, searchedTeam: state.filteredTeam }));
    }
  }, [searchText, state.filteredTeam]);

  const closeProfileModal = () => {
    setProfileModalShow(false);
    setState((prev) => ({ ...prev, selectedStaff: null }));
  };
  const closeAddSchool = () => {
    setAddSchoolShow(false);
  };

  const links = [
    {
      ref: "/teams",
      title: <FormattedMessage id="teams" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={links} />
      </div>
      <SearchBar
        placeholder={`Search by names`}
        size={"small"}
        handleSearch={(value) => setSearchText(value)}
      />
      <div className={classes.default_headerSection_actionsContainer}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            history.push("/teams/register");
          }}
        >
          <FormattedMessage id="add_new_staff"></FormattedMessage>
        </Button>
        {/* <Button
          onClick={() => {
            setAddSchoolShow(true);
          }}
        >
          <FormattedMessage id="add_new_boardingschool"></FormattedMessage>
        </Button> */}

        <MenuMultiple
          list={state.roleOptions}
          entity={"Roles"}
          handleChange={(options) => {
            setState((prev) => ({ ...prev, selectedRoles: options }));
          }}
        />
        <MenuMultiple
          list={state.groupOptions}
          entity={"Groups"}
          handleChange={(options) => {
            setState((prev) => ({ ...prev, selectedGroups: options }));
          }}
        />
      </div>
    </div>
  );

  const handleFavorite = async (staff) => {
    if ((staff.favoriteBy || []).includes(user.id)) {
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("staff")
        .doc(staff.id)
        .update({
          favoriteBy: firebase.firestore.FieldValue.arrayRemove(user.id),
        });
    } else {
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("staff")
        .doc(staff.id)
        .update({
          favoriteBy: firebase.firestore.FieldValue.arrayUnion(user.id),
        });
    }
  };

  const renderItem = (staff) => {
    return (
      <Fragment>
        <TableCell>
          <div className={classes.groupMetaCell}>
            <div onClick={stopEventBubble(() => handleFavorite(staff))}>
              <img
                src={
                  (staff.favoriteBy || []).includes(user.id) ? Star : StarOut
                }
              />
            </div>
            <Box mx={1}>
              <Avatar src={staff?.image || defaultAvatars?.staff} />
            </Box>
            <Typography className={classes.default_typography_capitalize}>
              {staff.name}
            </Typography>
          </div>
        </TableCell>
        <TableCell className={classes.default_typography_capitalize}>
          {staff._groups}
        </TableCell>
        <TableCell>{RoleMappings[staff.type]}</TableCell>
      </Fragment>
    );
  };

  const tableProps = {
    data: state.searchedTeam,
    renderItem,
    headers,
    loadMore,
    handleRowClick: (staff) => {
      setState((prev) => ({ ...prev, selectedStaff: staff }));
      setProfileModalShow(true);
    },
  };

  return loading ? (
    <Loader />
  ) : (
    <section
      className={clsx([classes.default_page_root, classes.default_page_Bg1])}
    >
      <SimpleModal
        extended
        title={<FormattedMessage id="profile" />}
        open={profileModalShow}
        handleClose={closeProfileModal}
      >
        <ProfileBody
          handleClose={closeProfileModal}
          staffId={state.selectedStaff?.id}
        />
      </SimpleModal>
      {/* <SimpleModal
        title={<FormattedMessage id="add_new_boarding_school" />}
        open={addSchoolShow}
        handleClose={closeAddSchool}
      >
        <AddSchoolBody handleClose={closeAddSchool} />
      </SimpleModal> */}

      {actionBar}

      <DataTable {...tableProps} />
    </section>
  );
});

const useStyles = makeStyles((theme) => {
  return {
    ...getPageStyles(theme),
    ...getSectionHeaderStyles(theme),
    ...getTypographyStyles(theme),
    groupMetaCell: {
      display: "flex",
      alignItems: "center",
    },
  };
});

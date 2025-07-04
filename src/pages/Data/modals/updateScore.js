import {
  Input,
  makeStyles,
  Typography,
  TableCell,
  Checkbox,
  FormControlLabel,
  Avatar,
  Box,
  
} from "@material-ui/core";
import clsx from "clsx";
import { nanoid } from "nanoid";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Steps,
  SearchBar,
  MenuMultiple,
  Summary,
  Field,
  DataTable,
} from "../../../components";
import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";
import {
  getModalStyles,
  FirebaseHelpers,
  getSectionHeaderStyles,
  getPageStyles,
  searchBy,
} from "../../../utils/helpers";
import * as yup from "yup";
const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
    ...getSectionHeaderStyles(theme),
    ...getPageStyles(theme),
    summaryRoot: {
      margin: `0 auto`,
      borderRadius: 20,
      width: "fit-content",
      background: `#F9FAFA`,
      padding: 10,
    },
    selectAllDiv: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    selectAllTypo: {
      fontWeight: "bold",
    },
  };
});

const steps = [
  {
    title: `update_score`,
    validator: (state) => {
      // if (state.score <= 0) return 'please enter a valid score';
    },
    Component: (props) => {
      const { payload, setPayload } = props;
      const classes = useStyles();
      const [score, setScore] = useState(0);

      useEffect(() => {
        setPayload((prev) => ({ ...prev, score }));
      }, [score]);

      return (
        <Fragment>
          <Field label={<FormattedMessage id="enter_score" />}>
            <Input
              inputProps={{ min: 0 }}
              className={classes.input}
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </Field>
        </Fragment>
      );
    },
  },
  {
    title: `groups`,
    validator: (state) => {
      if (state.selectedGroups.length == 0) return "please select a group";
    },
    Component: (props) => {
      const { payload, setPayload } = props;
      const classes = useStyles();
      const [searchText, setSearchText] = useState("");

      const [state, setState] = useState({
        groups: [],
        selectedGroups: [],
        searchedGroups: [],
      });

      const selectedGroupIds = state.selectedGroups.map((el) => el.id);
      const handleSelectAll = (checked) => {
        const groups = state.groups;
        if (checked) {
          setState((prev) => ({ ...prev, selectedGroups: groups }));
        } else {
          setState((prev) => ({ ...prev, selectedGroups: [] }));
        }
      };
      const headers = useMemo(
        () => [
          {
            id: ` `,
          },
          {
            id: `GROUP_NAME`,
          },
          {
            id: `KID_NUMBER`,
          },
          ,
        ],
        []
      );

      const { state: storeState } = useStore();
      const { user } = storeState;

      useEffect(() => {
        setPayload((prev) => ({
          ...prev,
          selectedGroups: state.selectedGroups,
        }));
      }, [state.selectedGroups]);

      useEffect(() => {
        (async () => {
          const _groups = await FirebaseHelpers.fetchGroups.execute({ user });
          setState((prev) => ({
            ...prev,
            groups: _groups,
            selectedGroups: payload.selectedGroups,
          }));
        })();
      }, []);

      useEffect(() => {
        if (searchText) {
          setState((prev) => ({
            ...prev,
            searchedGroups: searchBy(prev.groups, ["name"], searchText),
          }));
        } else {
          setState((prev) => ({ ...prev, searchedGroups: prev.groups }));
        }
      }, [searchText, state.groups]);

      const handleChange = (group) => {
        const exists = state.selectedGroups.find((el) => el.id === group.id);

        if (exists) {
          setState((prev) => ({
            ...prev,
            selectedGroups: prev.selectedGroups.filter(
              (el) => el.id !== group.id
            ),
          }));
        } else {
          setState((prev) => ({
            ...prev,
            selectedGroups: [...prev.selectedGroups, group],
          }));
        }
      };

      const renderItem = (group) => {
        return (
          <Fragment>
            <TableCell className={classes.cell}>
              <Checkbox
                style={{
                  color: "#685BE7",
                }}
                checked={selectedGroupIds.includes(group.id)}
                disableRipple
                onChange={() => handleChange(group)}
              />
            </TableCell>
            <TableCell className={classes.cell}>{group.name}</TableCell>
            <TableCell className={classes.cell}>
              {group.kids_ids.length}
            </TableCell>
          </Fragment>
        );
      };

      const actionBar = (
        
         <Box display={"flex"} padding="10px">
          <SearchBar
          
            placeholder={"search_by_names"}
            size={"sm"}
            handleSearch={(value) => setSearchText(value)}
          />
          
       
        <Checkbox
        style={{
          color: "#685BE7",
        }}
          onChange={(e) => handleSelectAll(e.target.checked)}
          checked={selectedGroupIds.length == state.groups.length}
        />
      
         <Typography className={classes.selectAllTypo} style={{fontSize:16}}>
          Select All
        </Typography>
      
        </Box>
      
        
       
      );

      const tableProps = {
        data: state.searchedGroups,
        renderItem,
        headers,
        loadMore: null,
      };

      return (
        <Fragment>
          {actionBar}
          <section
            className={clsx([
              classes.default_page_root,
              classes.default_page_Bg2,
            ])}
          >
            <DataTable {...tableProps} />
          </section>
        </Fragment>
      );
    },
  },
  {
    title: `kids`,
    validator: (state) => {
      if (state.selectedKids.length == 0) return "please select a kid";
    },
    Component: (props) => {
      const {
        payload: { selectedGroups = [], selectedKids = [] },
        setPayload,
      } = props;

      const classes = useStyles();

      const [state, setState] = useState({
        kids: [],
        searchedKids: [],
        filteredKids: [],
        selectedKids: [],
        options: [],
      });

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
          ,
        ],
        []
      );

      const { state: storeState } = useStore();
      const { user, defaultAvatars } = storeState;

      useEffect(() => {
        setPayload((prev) => ({ ...prev, selectedKids: state.selectedKids }));
      }, [state.selectedKids]);

      useEffect(() => {
        (async () => {
          const _kids = (
            await db
              .collection("Institution")
              .doc(user?._code)
              .collection("kid")
              .where(
                "groupId",
                "in",
                selectedGroups.map((el) => el.id)
              )
              .get()
          ).docs.map((el) => el.data());
          setState((prev) => ({
            ...prev,
            kids: _kids,
            filteredKids: _kids,
            selectedKids,
          }));
        })();
      }, []);

      useEffect(() => {
        if (!selectedGroups.length) return;
        const _groups = selectedGroups.map((el) => {
          return {
            id: el.id,
            name: el.name,
            label: el.name,
            groupId: el.id,
          };
        });
        setState((prev) => ({ ...prev, options: _groups }));
      }, [selectedGroups]);

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
      const handleSelectAll = (checked) => {
        const kids = state.kids;
        if (checked) {
          setState((prev) => ({ ...prev, selectedKids: kids }));
        } else {
          setState((prev) => ({ ...prev, selectedKids: [] }));
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
              placeholder={"search_by_names"}
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
          <div className={classes.selectAllDiv}>
            <Typography className={classes.selectAllTypo}>
              Select All
            </Typography>
            <Checkbox
              onChange={(e) => handleSelectAll(e.target.checked)}
              checked={selectedKidsIds.length == state.kids.length}
            />
          </div>
        </div>
      );

      const tableProps = {
        data: state.searchedKids,
        renderItem,
        headers,
        loadMore: null,
      };

      return (
        <Fragment>
          {actionBar}
          <section
            className={clsx([
              classes.default_page_root,
              classes.default_page_Bg2,
            ])}
          >
            <DataTable {...tableProps} />
          </section>
        </Fragment>
      );
    },
  },
  {
    title: `summary`,
    Component: (props) => {
      const classes = useStyles();
      const {
        payload: { score, selectedGroups, selectedKids },
      } = props;

      const summaries = [
        {
          title: <FormattedMessage id="score" />,
          summary: null,
          figure: score,
        },
        {
          title: <FormattedMessage id="groups" />,
          summary: selectedGroups.map((el) => el.name).join(", "),
          figure: selectedGroups.length,
        },
        {
          title: <FormattedMessage id="kids" />,
          summary: selectedKids.map((el) => el.name).join(", "),
          figure: selectedKids.length,
        },
      ];

      return (
        <section
          className={clsx([
            classes.default_page_root,
            classes.default_page_Bg2,
            classes.summaryRoot,
          ])}
        >
          {summaries.map((el, idx) => (
            <Summary {...{ ...el, id: idx + 1 }} />
          ))}
        </section>
      );
    },
  },
];

export const UpdateScoreBody = (props) => {
  const { handleClose } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;

  const [state, setState] = useState({
    score: 0,
    selectedGroups: [],
    selectedKids: [],
  });
  const Schema = useMemo(() => {
    return yup.object().shape({
      score:yup.number().required().min(0).max(99999)
    });
  }, []);
  const handleSubmit = async () => {
    
    try{
      if (state.score <= 0)
      return actions.alert("Please Enter a valid score", "error");
      Schema.validateSync({
        score: state.score
      });
    const historyId = nanoid(6);
    const batch = db.batch();

    state.selectedKids.map(async (kid) => {
      const ref = db
        .collection("Institution")
        .doc(user?._code)
        .collection("kid")
        .doc(kid.id);
      batch.update(ref, {
        score: Number(state.score),
      });
    });

    const historyRef = db
      .collection("Institution")
      .doc(user?._code)
      .collection("History")
      .doc(historyId);

    batch.set(historyRef, {
      type: "Update Score Data",
      executer: user.name,
      executedBy:
        state.selectedKids.length > 1
          ? `${state.selectedKids.length} Kids`
          : `${state.selectedKids[0].name}`,
      time: new Date(),
      payload: {
        groups: state.selectedGroups,
        kids: state.selectedKids,
        score: state.score,
      },
      id: historyId,
      _staff: [user.id],
      _kids: state.selectedKids.map((el) => el.id),
      _groups: state.selectedGroups.map((el) => el.id),
    });

    await batch.commit();

    handleClose();
    }
    catch(error){
      actions.alert(error.message, "error");
    }


   
  };

  return (
    <Steps
      steps={steps}
      stepsState={state}
      setStepsState={setState}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
    />
  );
};

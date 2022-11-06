import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Typography,
  makeStyles,
  Box,
  Grid,
} from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  AddIcon,
  Button,
  Loader,
  SimpleModal,
  Links,
  Pause,
  HistoryTable,
  Level,
  AddIconSim,
} from "../../components";
import { db } from "../../utils/firebase";
import { useStore, useUi } from "../../store";


import {
  getSectionHeaderStyles,
  getPageStyles,
  getTypographyStyles,
} from "../../utils/helpers";
import clsx from "clsx";
import ScrollArea from "react-scrollbar";

import { PERMISSIONS } from "../../utils/constants";
import { nanoid } from "nanoid";

import { EditLevelBody } from "./modals/editLevel";

const headers = [
  {
    id: `name`,
  },
  {
    id: `group_name`,
  },
  {
    id: `level`,
  },
];

export const SpecialProgramDetail = React.memo(() => {
  const history = useHistory();
  const params = useParams();
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user, orientation, defaultAvatars } = storeState;

  const listenersRef = useRef([]);

  const [kid, setKid] = useState();
  const [selectedLevel, setSelectedLevel] = useState();
  const [levels, setLevels] = useState([]);

  const [modalStates, setModalStates] = useState({
    levelDetail: false,
    editLevel: false,
  });

  const closeLevelDetail = () => {
    setModalStates((prev) => ({ ...prev, levelDetail: false }));
  };
  const closeEditLevel = () => {
    setModalStates((prev) => ({ ...prev, editLevel: false }));
  };

  useEffect(() => {
    (async () => {
      listenersRef.current.push(
        db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(params.id)
          .onSnapshot(async (querySnapshot) => {
            setKid(querySnapshot.data());
          })
      );
      listenersRef.current.push(
        db
          .collection("Institution")
          .doc(user._code)
          .collection("kid")
          .doc(params.id)
          .collection("levels")
          .orderBy("level", "desc")
          .onSnapshot(async (querySnapshot) => {
            setLevels(querySnapshot.docs.map((el) => el.data()));
          })
      );
    })();

    return () => {
      listenersRef.current.length && listenersRef.current.forEach((el) => el());
    };
  }, []);



  const links = [
    {
      ref: "/specialProgram",
      title: <FormattedMessage id="special_program" />,
    },
    {
      ref: `/specialProgram/${params.id}`,
      title: <FormattedMessage id="profile" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={links} />
      </div>
    </div>
  );

  const rootQuery = useMemo(
    () =>
      db
        .collection("Institution")
        .doc(user._code)
        .collection("History")
        .where("_kidIds", "array-contains", params.id),
    []
  );

  const handleStopLevel = async () => {
    if (!user.permissions[PERMISSIONS.kidSpecialReport])
      return actions.showAlert(
        "You don't have access to perform this action",
        "info"
      );

    const action = async () => {
      await Promise.all(
        levels.map(async (level) => {
          const subjects = (
            await db
              .collection("Institution")
              .doc(user._code)
              .collection("kid")
              .doc(kid.id)
              .collection("levels")
              .doc(level.id)
              .collection("subjects")
              .get()
          ).docs.map((el) => el.data());

          await Promise.all(
            subjects.map((subject) =>
              db
                .collection("Institution")
                .doc(user._code)
                .collection("kid")
                .doc(kid.id)
                .collection("levels")
                .doc(level.id)
                .collection("subjects")
                .doc(subject.id)
                .delete()
            )
          );

          await db
            .collection("Institution")
            .doc(user._code)
            .collection("kid")
            .doc(kid.id)
            .collection("levels")
            .doc(level.id)
            .delete();
        })
      );

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(kid.id)
        .update({
          has_special_program: false,
          currentSpecialLevel: 0,
        });
      history.push("/specialProgram");
    };

    actions.showDialog({
      action,
      title: `Stop current Level?`,
      body: "Are you sure you want to Stop Level? it cannot be undone",
    });
  };

  const handleNewLevel = () => {
    if (!user.permissions[PERMISSIONS.kidSpecialReport])
      return actions.showAlert(
        "You don't have access to perform this action",
        "info"
      );

    const action = async () => {
      const currentLevel = levels.find((el) => el.currentLevel);

     

      const id = nanoid(6);
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(params.id)
        .collection("levels")
        .doc(id)
        .set({
          currentLevel: true,
          level: Number(currentLevel.level) + Number(1),
          endDate: "",
          id: id,
          startDate: new Date(),
        });
      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(params.id)
        .collection("levels")
        .doc(currentLevel.id)
        .update({
          currentLevel: false,
          endDate: new Date(),
        });

      await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .doc(params.id)
        .update({
          currentSpecialLevel: Number(currentLevel.level) + Number(1),
        });
    };

    actions.showDialog({
      action,
      title: `Start New Level?`,
      body: "Are you sure you want to Start New Level? it cannot be undone",
    });
  };

  const hasLevel = levels.filter((el) => el.currentLevel)[0]?.level;

  return loading ? (
    <Loader />
  ) : (
    <section
      className={clsx([classes.default_page_root, classes.default_page_Bg1])}
    >
      <SimpleModal
        title={<FormattedMessage id="edit_current_level" />}
        open={modalStates.editLevel}
        handleClose={closeEditLevel}
      >
        <EditLevelBody
          currentLevel={levels[0]}
          kid={kid}
          handleClose={closeEditLevel}
        />
      </SimpleModal>

      {actionBar}

      <Grid container className={classes.profileContainer}>
        <Grid xs={12} md={3}>
          <Box
            display={"flex"}
            flexDirection="column"
            alignItems={"center"}
            p={3}
          >
            <img
              className={classes.profileImage}
              src={kid?.image || defaultAvatars?.kid}
              alt="profile-img"
            />
            <Box>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_heading,
                ])}
              >
                {kid?.name}
              </Typography>
            </Box>
            <Box>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_paragraph,
                  classes.default_typography_colorPrimary,
                ])}
              >
                {hasLevel ? `Level ${hasLevel}` : "Not started"}
              </Typography>
            </Box>
            {!!hasLevel && (
              <Box marginY={0.5}>
                <Button
                  startIcon={<AddIconSim />}
                  onClick={() => {
                    setModalStates((prev) => ({ ...prev, editLevel: true }));
                  }}
                >
                  <FormattedMessage id="edit_current_level" />
                </Button>
              </Box>
            )}
            <Box marginY={0.5}>
              <Button startIcon={<AddIcon />} onClick={handleNewLevel}>
                <FormattedMessage id="start_new_level" />
              </Button>
            </Box>
            <Box marginY={0.5}>
              <Button
                className={classes.buttonStop}
                startIcon={<Pause />}
                onClick={handleStopLevel}
              >
                <FormattedMessage id="stop_current_level" />
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid
          xs={12}
          md={3}
          style={{
            height: "100%",
          }}
        >
          <Box
            p={3}
            style={{
              height: "100%",
            }}
          >
            <div
              className={clsx([
                classes.default_page_root,
                classes.default_page_BgTransparent,
                classes.default_page_removePadding,
                classes.default_page_removeCurves,
              ])}
            >
              <ScrollArea smoothScrolling speed={0.8}>
                <Box
                  display={"flex"}
                  flexDirection="column"
                  alignItems={"center"}
                >
                  <Typography
                    className={clsx([
                      classes.default_typography_capitalize,
                      classes.default_typography_bold,
                      classes.default_typography_paragraph,
                      classes.default_typography_colorLight,
                    ])}
                  >
                    <FormattedMessage id="current_level" />
                  </Typography>

                  {levels
                    .filter((el) => !el.currentLevel)
                    .map((_level) => {
                      return (
                        <Box marginY={1}>
                          <Level
                            onClick={() => setSelectedLevel(_level)}
                            level={_level.level}
                            selected={selectedLevel === _level}
                          />
                        </Box>
                      );
                    })}
                </Box>
              </ScrollArea>
            </div>
          </Box>
        </Grid>
        <Grid xs={12} md={6}></Grid>
      </Grid>

      <section className={clsx([classes.default_page_root])}>
        <HistoryTable rootQuery={rootQuery} />
      </section>
    </section>
  );
});

const useStyles = makeStyles((theme) => {
  return {
    ...getSectionHeaderStyles(theme),
    ...getPageStyles(theme),
    ...getTypographyStyles(theme),

    profileContainer: {
      background: "#fff",
      borderRadius: 12,
      marginBottom: 20,
    },
    profileImage: {
      height: 100,
      width: 100,
      borderRadius: 20,
      objectFit: "cover",
    },
    buttonStop: {
      background: `#FF4031 !important`,
    },
  };
});

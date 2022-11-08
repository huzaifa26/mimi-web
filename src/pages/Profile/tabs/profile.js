import { Box, Input, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { Fragment, useEffect, useMemo, useState } from "react";

import { FormattedMessage } from "react-intl"; //Used for dual language text

import { useStore, useUi } from "../../../store";
import { db } from "../../../utils/firebase";

import clsx from "clsx";
import { Button, HistoryTable, SimpleModal } from "../../../components";
import { getPageStyles, getTypographyStyles } from "../../../utils/helpers";
import { UploadImageBody } from "../modals/uploadImage";

export const Profile = () => {
  const classes = useStyles();

  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user, defaultAvatars } = storeState;

  const [image, setImage] = useState();
  const [uploadModal, setUploadModal] = useState();
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState([]);
  

  useEffect(() => {
    if (!image) return;

    setUploadModal(true);
  }, [image]);

  // To get the groups
  useEffect(() => {
    (async () => {
      const totalGroups = (
        await db
          .collection("Institution")
          .doc(user?._code)
          .collection("groups")
          .get()
      ).docs.map((el) => el.data());
      setGroups(totalGroups);
    })();
  }, [user._code]);


  // To get a group
  useEffect(() => {
    (async () => {
      const ref = (
        await db
          .collection("Institution")
          .doc(user?._code)
          .collection("groups")
          .where("id", "==", user?.group_ids[0])
          .get()
      ).docs.map((el) => el.data());
      setGroup(ref);
    })();
  }, []);


  const closeUploadModal = () => {
    setUploadModal(false);
    setImage(null);
  };
  const hanldeFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
  };

  const handleDefaultImage = () => {
    const action = async () => {
      await db
        .collection("Institution")
        .doc(user?._code)
        .collection("staff")
        .doc(user?.id)
        .update({
          image: "",
        });
    };

    actions.showDialog({
      action,
      title: `Use Default Image?`,
      body: "Are you sure you want to use default avatar as you profile image",
    });
  };

  const rootQuery = useMemo(
    () =>
      db
        .collection("Institution")
        .doc(user?._code)
        .collection("History")
        .where("_staff", "array-contains", user?.id),
    []
  );

  return (
    <Fragment>
      <SimpleModal
        title={<FormattedMessage id="upload_image" />}
        open={uploadModal}
        handleClose={closeUploadModal}
      >
        <UploadImageBody image={image} handleClose={closeUploadModal} />
      </SimpleModal>

      <section
        className={clsx([
          classes.default_page_root,
          classes.default_page_removePadding,
          classes.default_page_BgTransparent,
        ])}
      >
        <div className={classes.profileContainer}>
          <Box marginX={2} marginY={1}>
            <img
              src={user?.image || defaultAvatars?.staff}
              className={classes.profileImage}
              alt=""
            />
          </Box>
          <Box marginX={2} marginY={1}>
            <Box marginY={1}>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_heading,
                ])}
              >
                {user?.name}
              </Typography>
            </Box>

            <Box marginY={1}>
              <Typography
                className={clsx([
                  classes.default_typography_capitalize,
                  classes.default_typography_bold,
                  classes.default_typography_paragraph,
                  classes.default_typography_colorLight,
                ])}
              >
                {user?.email}
              </Typography>
            </Box>

            {user?.type === "admin" ? (
              <Box marginY={1}>
                <Typography
                  className={clsx([
                    classes.default_typography_capitalize,
                    classes.default_typography_bold,
                    classes.default_typography_paragraph,
                    classes.default_typography_colorLight,
                  ])}
                >
                  Groups: {groups.length}
                </Typography>
              </Box>
            ) : user?.group_ids.length !== 0 ? (
              user?.group_ids.length > 1 ? (
                <Box marginY={1}>
                  <Typography
                    className={clsx([
                      classes.default_typography_capitalize,
                      classes.default_typography_bold,
                      classes.default_typography_paragraph,
                      classes.default_typography_colorLight,
                    ])}
                  >
                    Groups: {user?.group_ids.length}
                  </Typography>
                </Box>
              ) : (
                <Box marginY={1}>
                  <Typography
                    className={clsx([
                      classes.default_typography_capitalize,
                      classes.default_typography_bold,
                      classes.default_typography_paragraph,
                      classes.default_typography_colorLight,
                    ])}
                  >
                    Group: {group[0]?.name}
                  </Typography>
                </Box>
              )
            ) : (null
              // console.log("no group")
            )}
          </Box>
          <Box marginX={2} marginY={1}>
            <Box marginY={1}>
              <label htmlFor="contained-button-file">
                <Input
                  onChange={hanldeFile}
                  style={{
                    display: "none",
                  }}
                  accept="image/*"
                  id="contained-button-file"
                  type="file"
                />
                <Button
                  component="span"
                  className={classes.buttonUpload}
                  variant="outlined"
                >
                  <FormattedMessage id="upload_new" />
                </Button>
              </label>
            </Box>
            <Box marginY={1}>
              <Box
                style={{
                  cursor: "pointer",
                }}
                className={clsx([
                  classes.default_typography_colorPrimary,
                  classes.default_typography_bold,
                  classes.default_typography_paragraph,
                ])}
                onClick={() => handleDefaultImage()}
              >
                <Typography>
                  <FormattedMessage id="use_default_avatar" />
                </Typography>
              </Box>
            </Box>
          </Box>
        </div>

        <section className={clsx([classes.default_page_root])}>
          <HistoryTable rootQuery={rootQuery} />
        </section>
      </section>
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    ...getPageStyles(theme),
    ...getTypographyStyles(theme),
    profileContainer: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      background: "transparent",
    },
    profileImage: {
      height: 120,
      width: 120,
      borderRadius: 20,
      objectFit: "cover",
      overflow: "hidden",
    },
    buttonUpload: {
      borderWidth: 2,
      borderColor: "#685BE7",
      color: "#000 !important",
      background: `transparent !important`,
    },
  };
});

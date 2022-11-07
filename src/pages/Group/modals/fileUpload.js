import { Grid, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";
import { Button } from "../../../components";
import SheetJSApp from "../../../components/xlsx";
import { useStore, useUi } from "../../../store";
import { _auth } from "../../../utils/firebase";
import { FirebaseHelpers, getModalStyles } from "../../../utils/helpers";
import { db } from "../../../utils/firebase";

const useStyles = makeStyles((theme) => {
  return { ...getModalStyles(theme) };
});

export const FileUploadBody = (props) => {
  const classes = useStyles();
  const { actions } = useUi();
  const { state: storeState } = useStore();
  const { user, institute } = storeState;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { handleClose } = props;

  const handleFileSubmit = (value) => {
    if (loading) return;
    if (!data) return;
    setLoading(true);
    let counter = 0;
    value = value.filter((e, idx) => idx != 0);
    value.map(async (data) => {
      try {
        let name = data[0];
        const groups = await db
          .collection("Institution")
          .doc(user?._code)
          .collection("groups")
          .where("name", "==", name.toLowerCase())
          .get();
        console.log({ g: groups });
        if (!groups.empty)
          return actions.alert(
            "Group with same name already exists, Kindly choose a different name",
            "error"
          );
        await FirebaseHelpers.createGroup.execute({
          user,
          group: {
            name,
          },
        });
        counter = counter + 1;
        if (value.length == counter) {
          setLoading(false);
          handleClose();
        }
      } catch (error) {
        actions.alert(error.message, "error");
        setLoading(false);
      }
    });
  };
  const handleSubmit = (value) => {
    setData(value);
  };
  return (
    <Fragment className={classes.container}>
      <SheetJSApp handleSubmit={handleSubmit} />
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
              onClick={() => handleFileSubmit(data)}
            >
              <FormattedMessage id="submit" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};

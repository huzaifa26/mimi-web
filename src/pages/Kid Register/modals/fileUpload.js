import { Grid, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";
import { Button } from "../../../components";
import SheetJSApp from "../../../components/xlsx";
import { useStore, useUi } from "../../../store";
import { _auth } from "../../../utils/firebase";
import { FirebaseHelpers, getModalStyles } from "../../../utils/helpers";

const useStyles = makeStyles((theme) => {
  return { ...getModalStyles(theme) };
});

export const FileUploadBody = (props) => {
  const history = useHistory();
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
        let _name = data[0];
        let _type = data[1];
        let _email = data[2];
        let _group = props.groups.filter((e) => e.id == data[3]);
        let _password = data[4].toString();
        const _staff = await _auth.createUserWithEmailAndPassword(
          _email,
          _password
        );
        await FirebaseHelpers.createStaff.execute({
          user,
          institute,
          staff: {
            staffId: _staff.user.uid,
            name: _name,
            type: _type,
            email: _email,
            selectedGroups: _group,
          },
        });
        counter = counter + 1;
        if (value.length == counter) {
          setLoading(false);
          history.push("/teams");
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

import {Box ,Grid, Input, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Field } from "..";
import { useStore, useUi } from "../../store";
import { db } from "../../utils/firebase";
import { nanoid } from "nanoid";
import { getModalStyles } from "../../utils/helpers";

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(theme),
  };
});

export const SyncSubject = (props) => {
  const { handleClose, subId, subject,handleSyncSubject } = props;
  const classes = useStyles();
  const { state: storeState } = useStore();
  const { actions } = useUi();
  const { user } = storeState;
  const [score, setScore] = useState(0);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(false);

  const _handleSubmit = () => {
    handleSyncSubject(subId,subject)
    handleClose();
  };
  return (
    <Fragment>
      <Box>
        <Typography variant="h6">
            {
                subject.isSync ?
                <FormattedMessage id="unsync_message"/>
                :<FormattedMessage id="sync_message"/>
            }
        </Typography>
      </Box>

      <div className={classes.default_modal_footer}>
        <Grid container spacing={2}>
          <Grid item xs={6} justifyContent="center">
            <Button
              fullWidth
              disable={loading}
              className={classes.default_modal_buttonSecondary}
              onClick={handleClose}
            >
              <FormattedMessage id="no" />
            </Button>
          </Grid>
          <Grid item xs={6} justifyContent="center">
            <Button
              loading={loading}
              fullWidth
              disable={loading}
              onClick={_handleSubmit}
            >
              <FormattedMessage id="yes" />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};

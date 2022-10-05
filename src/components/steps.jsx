import React, { Fragment, useState } from "react";
import { makeStyles, Typography, Grid } from "@material-ui/core";
import clsx from "clsx";
import { FormattedMessage } from "react-intl";
import { Button } from "./";
import { getModalStyles } from "../utils/helpers";

import StepTick from "../assets/icons/stepTick.png";
import { useUi } from "../store";

const useStyles = makeStyles((theme) => {
  return {
    ...getModalStyles(),
    stepsHeaderContainer: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
    },
    stepsHeaderIconContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      maxWidth: 50,
      margin: "0px 10px",
      textAlign: "center",
    },
    stepHeaderIcon: {
      borderRadius: "50%",
      width: 50,
      height: 50,
      background: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: `1px solid #685BE7`,
      marginBottom: 10,
      "& span": {
        display: "block",
        color: "#685BE7",
        fontWeight: "bold",
      },
      "& div.dot": {
        display: "none",
        width: 10,
        height: 10,
        background: "#685BE7",
        borderRadius: "50%",
      },
      "& img": {
        display: "none",
      },
    },
    active: {
      borderColor: `transparent`,
      background: `#d3cfff`,
      "& span": {
        display: "none",
      },
      "& img": {
        display: "none",
      },
      "& div.dot": {
        display: "block",
      },
    },
    completed: {
      borderColor: `#685BE7`,
      background: `#685BE7`,
      "& span": {
        display: "none",
      },
      "& div.dot": {
        display: "none",
      },
      "& img": {
        display: "block",
      },
    },
    divider: {
      marginTop: 8,
      overflow: "hidden",
      maxWidth: 100,
      "&::after": {
        fontSize: 20,
        content: '"........"',
        letterSpacing: 10,
      },
    },
  };
});

export const Steps = ({
  steps,
  handleClose,
  handleSubmit,
  stepsState,
  setStepsState,
  type,
}) => {
  const classes = useStyles();
  const { actions } = useUi();

  const [currentStep, setCurrentStep] = useState(0);

  const [loading, setLoading] = useState(false);

  const validator = steps[currentStep].validator;

  const hanldePrevious = () => {
    if (currentStep === 0) {
      handleClose();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const hanldeNext = async () => {
    if (currentStep === steps.length - 1) {
      setLoading(true);
      await handleSubmit();
      setLoading(false);
    } else {
      const message = validator(stepsState);
      if (message) return actions.alert(message, "error");

      setCurrentStep((prev) => prev + 1);
    }
  };

  const Component = steps[currentStep].Component;

  return (
    <Fragment>
      <div className={classes.stepsHeaderContainer}>
        {(steps || []).map((el, idx) => {
          return (
            <Fragment>
              <div className={classes.stepsHeaderIconContainer}>
                <div
                  className={clsx({
                    [classes.stepHeaderIcon]: true,
                    [classes.active]: idx === currentStep,
                    [classes.completed]: idx < currentStep,
                  })}
                >
                  <div className="dot" />
                  <img src={StepTick} />
                  <span>{idx + 1}</span>
                </div>

                <Typography>
                  <FormattedMessage id={el.title} />
                </Typography>
              </div>
              {idx !== steps.length - 1 && <div className={classes.divider} />}
            </Fragment>
          );
        })}
      </div>

      <Component payload={stepsState} setPayload={setStepsState} />

      <div className={classes.default_modal_footer}>
        <Grid container spacing={2}>
          <Grid item xs={6} justifyContent="center">
            <Button
              fullWidth
              disable={loading}
              className={classes.default_modal_buttonSecondary}
              onClick={hanldePrevious}
            >
              <FormattedMessage
                id={currentStep === 0 ? `cancel` : `previous_step`}
              />
            </Button>
          </Grid>
          <Grid item xs={6} justifyContent="center">
            <Button
              loading={loading}
              fullWidth
              disable={loading}
              onClick={hanldeNext}
            >
              <FormattedMessage
                id={currentStep === steps.length - 1 ? `submit` : `next`}
              />
            </Button>
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};

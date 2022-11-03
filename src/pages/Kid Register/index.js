import React, { useEffect, useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Input, Grid } from "@material-ui/core";
import PasswordStrengthBar from "react-password-strength-bar";
import {
  Field,
  Form,
  Links,
  MenuMultiple,
  MenuSingle,
  Button,
  SimpleModal,
} from "../../components";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import moment from "moment";
import { db } from "../../utils/firebase";
import { useStore, useUi } from "../../store";
import ScrollArea from "react-scrollbar";
import {
  FirebaseHelpers,
  getPageStyles,
  getSectionHeaderStyles,
  getTypographyStyles,
} from "../../utils/helpers";
import { nanoid } from "nanoid";
import clsx from "clsx";
import * as yup from "yup";
import { FileUploadBody } from "./modals/fileUpload";

const days = [
  {
    id: "6",
    name: <FormattedMessage id="sunday" />,
    label: <FormattedMessage id="sunday" />,
  },
  {
    id: "0",
    name: <FormattedMessage id="monday" />,
    label: <FormattedMessage id="monday" />,
  },
  {
    id: "1",
    name: <FormattedMessage id="tuesday" />,
    label: <FormattedMessage id="tuesday" />,
  },
  {
    id: "2",
    name: <FormattedMessage id="wednesday" />,
    label: <FormattedMessage id="wednesday" />,
  },
  {
    id: "3",
    name: <FormattedMessage id="thursday" />,
    label: <FormattedMessage id="thursday" />,
  },
  {
    id: "4",
    name: <FormattedMessage id="friday" />,
    label: <FormattedMessage id="friday" />,
  },
  {
    id: "5",
    name: <FormattedMessage id="saturday" />,
    label: <FormattedMessage id="saturday" />,
  },
];

export const RegisterKid = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { actions } = useUi();
  const { state: storeState } = useStore();
  const { user, institute } = storeState;

  const default_assigned_days = institute?.default_assigned_days || [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  const [groups, setGroups] = useState([]);
  const [defaultAssignedDays, setDefaultAssignedDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState();
  const [fileUpload, setFileUpload] = useState(false);

  //  form
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [group, setGroup] = useState();
  const [joinDate, setJoinDate] = useState(new Date());

  const Schema = useMemo(() => {
    return yup.object().shape({
      name: yup.string().min(2).max(16).required(),
      username: yup
        .string()
        .min(2)
        .max(16)
        .test("whitespace", "no spaces allowed in username", function (value) {
          return !/\s/.test(value.trim());
        })
        .required(),
      confirmPassword: yup
        .string()
        .test("passwords-match", "Passwords must match", function (value) {
          return this.parent.password === value;
        }),
      password: yup.string().min(4).max(16).required(),
      assigned_days: yup
        .array()
        .test(
          "select-one-day",
          "must select atleast one day",
          function (value) {
            return value.some((el) => el);
          }
        )
        .required(),
      joinDate: yup.date().max(new Date()).required(),
      group: yup.object().nullable(false).required(),
    });
  }, []);

  useEffect(() => {
    (async () => {
      const data = await FirebaseHelpers.fetchGroups.execute({
        user,
      });
      setGroups(data);
    })();
  }, []);

  useEffect(() => {
    setDefaultAssignedDays(
      default_assigned_days
        .map((el, idx) => {
          if (el) {
            return days.find((day) => day.id == idx);
          }
        })
        .filter((el) => el)
    );
  }, [default_assigned_days]);

  useEffect(() => {
    setFeedback(
      password != confirmPassword ? (
        <FormattedMessage id="passwords_does_not_match" />
      ) : (
        ""
      )
    );
  }, [password, confirmPassword]);

  const handleJoinDateChange = async (date) => {
    setJoinDate(date);
  };
  const handleFileModalClose = () => {
    setFileUpload(false);
  };

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const kidExists = await db
        .collection("Institution")
        .doc(user._code)
        .collection("kid")
        .where("username", "==", username.toLowerCase())
        .get();
      if (!kidExists.empty)
       actions.alert(
          "Kid with same name already exists, Kindly choose a different name", "error"
        );

      const payload = {
        password,
        name,
        username: username.trim().toLowerCase(),
        confirmPassword,
        group,
        joinDate,
        assigned_days: selectedDays,
      };

      Schema.validateSync(payload);

      const kidId = nanoid(6);

      await FirebaseHelpers.createKid.execute({
        user,
        institute,
        kid: {
          kidId,
          ...payload,
        },
      });
      history.push("/kids");

      actions.alert("Kid added successfully", "success");
    } catch (error) {
      // actions.alert(error.message, "error");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const links = [
    {
      ref: "/kids",
      title: <FormattedMessage id="kids" />,
    },
    {
      ref: "/kids/register",
      title: <FormattedMessage id="registration" />,
    },
  ];

  const actionBar = (
    <div className={classes.default_headerSection_container}>
      <div className={classes.default_headerSection_pageTitle}>
        <Links links={links} />
      </div>
    </div>
  );

  return (
    <section
      className={clsx([classes.default_page_root, classes.default_page_Bg1])}
    >
      <SimpleModal
        extended
        title={<FormattedMessage id="upload_file" />}
        open={fileUpload}
        handleClose={handleFileModalClose}
      >
        <FileUploadBody handleClose={handleFileModalClose} groups={groups} />
      </SimpleModal>
      {actionBar}

      <ScrollArea smoothScrolling>
        <Form>
          <Typography
            align="center"
            className={clsx([
              classes.default_typography_capitalize,
              classes.default_typography_bold,
              classes.default_typography_subHeading,
            ])}
          >
            <FormattedMessage id={"kid_registration"} />
          </Typography>

          <Field label={<FormattedMessage id="kid_name" />}>
            <Input
              autoComplete="new-password"
              fullWidth
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label={<FormattedMessage id="kid_username" />}>
            <Input
              autoComplete="new-password"
              fullWidth
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>
          <Field label={<FormattedMessage id="new_password" />}>
            <Input
              autoComplete="new-password"
              type={"password"}
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label={<FormattedMessage id="confirm_new_password" />}>
            <Input
              autoComplete="new-password"
              type={"password"}
              fullWidth
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>

          <PasswordStrengthBar password={password} minLength={6} />

          {feedback && (
            <Typography
              className={clsx([
                classes.default_typography_label,
                classes.default_typography_colorFailure,
              ])}
              align="center"
            >
              {feedback}
            </Typography>
          )}

          <Grid container>
            <Grid item xs={6}>
              <Field label={<FormattedMessage id="select_group" />}>
                <MenuSingle
                  list={groups}
                  label={group?.name || "none"}
                  handleChange={(item) => {
                    setGroup(item);
                  }}
                />
              </Field>
            </Grid>
            <Grid item xs={6}>
              <Field label={<FormattedMessage id="assign_days" />}>
                <MenuMultiple
                  prefix={<FormattedMessage id="Days: " />}
                  defaultSelected={defaultAssignedDays}
                  list={days}
                  entity={"Days"}
                  handleChange={(list) => {
                    const _arr = new Array(7).fill(null).map((el, index) => {
                      const exists = list.find((day) => day.id == index);
                      return !!exists;
                    });

                    setSelectedDays(_arr);
                  }}
                />
              </Field>
            </Grid>
          </Grid>

          <Field label={<FormattedMessage id="joined_date" />}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                value={joinDate}
                labelFunc={(date) => moment(date).format("DD/MM/YYYY")}
                onChange={handleJoinDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>
          </Field>

          <Button loading={loading} disabled={loading} onClick={handleSubmit}>
            <FormattedMessage id="register" />
          </Button>
        </Form>
      </ScrollArea>
    </section>
  );
};

const useStyles = makeStyles((theme) => ({
  ...getSectionHeaderStyles(theme),
  ...getPageStyles(theme),
  ...getTypographyStyles(theme),
}));

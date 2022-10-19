import {
  Button,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React, { Fragment, useState } from "react";
import { getPageStyles, getSectionHeaderStyles } from "../../../utils/helpers";
import { FormattedMessage } from "react-intl";
import GroupIcon from "../../../assets/icons/groupsIData.png";
import KidIcon from "../../../assets/icons/kid.png";
import StaffIcon from "../../../assets/icons/staffData.png";
import Tick from "../../../assets/icons/tickIconData.png";
import { db } from "../../../utils/firebase";
import { FirebaseHelpers } from "../../../utils/helpers";
import { useStore, useUi } from "../../../store";
import { _auth } from "../../../utils/firebase";
import { nanoid } from "nanoid";
import DragAndDrop from "../../../components/DragAndDrop";
import clsx from "clsx";
import CsvDownloader from "react-csv-downloader";
import ScrollArea from "react-scrollbar";
import { Button as CButton } from "../../../components/button";
import { TextRotationAngledown } from "@material-ui/icons";

const useStyles = makeStyles((theme) => {
  return {
    ...getSectionHeaderStyles(theme),
    ...getPageStyles(theme),
    summaryRoot: {
      margin: `0 auto`,
      borderRadius: 20,
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
    gridContainer: {
      backgroundColor: "#F9FAFA",
    },
    gridItem: {
      height: 200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F9FAFA",
    },
    roundContainer: {
      height: 100,
      width: 100,
      borderRadius: 60,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "&:hover": {},
    },
    staffColor: {
      backgroundColor: "#E0F3F0",
      "&:hover": {
        backgroundColor: "#E0F3F0",
        opacity: 0.8,
      },
    },
    kidColor: {
      backgroundColor: "#F6E6F0",
      "&:hover": {
        backgroundColor: "#F6E6F0",
        opacity: 0.8,
      },
    },
    groupColor: {
      backgroundColor: "#E0ECFA",
      "&:hover": {
        backgroundColor: "#E0ECFA",
        opacity: 0.8,
      },
    },
    summaryHeader: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    box: {
      cursor: "pointer",
      borderRadius: 20,
      display: "flex",
      margin: 10,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: 180,
      width: 200,
      backgroundColor: "white",
    },
    buttonText: {
      fontWeight: "bold",
      fontSize: 20,
    },
    mainContainer: {
      backgroundColor: "#F9FAFA",
      display: "flex",
      flexDirection: "column",
      borderRadius: 20,
      margin: 20,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    summaryDiv: {
      height: "90vh",
      backgroundColor: "#F9FAFA",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      borderRadius: 20,
      margin: 10,
      overflow: "auto",
    },
    summaryTopDiv: {
      display: "flex",
      flexDirection: "column",
      borderRadius: 20,
      margin: 10,
      alignItems: "flex-start",
      padding: 20,
      width: "80%",
      backgroundColor: "#fff",
    },
    summaryMainDiv: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      borderRadius: 20,
      margin: 10,
      alignItems: "flex-start",
      padding: 20,
      width: "80%",
      backgroundColor: "#fff",
      overflowY: "auto",
    },

    dottedDiv: {
      marginBottom: 5,
      height: 300,
      width: 400,
      backgroundColor: "#fff",
      border: "8px dashed #C1DBDB",
      borderRadius: 30,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    greyText: {
      color: "#AFAFB2",
      fontWeight: 500,
    },
    summaryButton: {
      display: "flex",
      justifyContent: "flex-end",
      margin: 10,
    },

    summaryTitle: {
      fontWeight: "bold",
      fontSize: 20,
    },
    uploadButton: {
      width: 200,
      height: 40,
      fontSize: 14,
      borderRadius: 15,
      textTransform: "capitalize",
      backgroundColor: "#5740EB",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#5740EB",
        color: "#fff",
        opacity: 0.8,
      },
    },
    cancelButton: {
      width: 200,
      height: 40,
      backgroundColor: "#F4F4F6",
      color: "#000",
      fontSize: 14,
      borderRadius: 15,
      textTransform: "capitalize",
      "&:hover": {
        opacity: 0.8,
      },
    },
    pinkButton: {
      backgroundColor: "#F4EEF7",
      height: 50,
      width: 280,
      borderRadius: 15,
      color: "#000",
      fontSize: 15,
      fontWeight: "bold",
      margin: 20,
      textTransform: "capitalize",
      "&:hover": {
        backgroundColor: "#e9cdf7",
      },
    },
  };
});
const groupHeader = [
  {
    id: "name",
    displayName: "Name",
  },
];
const groupData = [
  {
    name: "Group Name",
  },
];
const staffHeader = [
  {
    id: "name",
    displayName: "name",
  },
  {
    id: "type",
    displayName: "type",
  },
  {
    id: "mail",
    displayName: "mail",
  },
  {
    id: "password",
    displayName: "password",
  },

  {
    id: "group",
    displayName: "group",
  },
];
const staffData = [
  {
    name: "Name",
    type: "Staff type",
    mail: "user@email.com",
    password: "password",
    group: "group name",
  },
];
const kidHeader = [
  {
    id: "name",
    displayName: "name",
  },
  {
    id: "username",
    displayName: "username",
  },
  {
    id: "password",
    displayName: "password",
  },
  {
    id: "group",
    displayName: "group",
  },
  {
    id: "assignDays",
    displayName: "assignDays",
  },
];
const kidData = [
  {
    name: "Kid Name",
    username: "Username",
    password: "password",
    group: "group name",
    assignDays: "0",
  },
];
export const FileUploadBody = (props) => {
  const { handleClose,showUploadType } = props;
  const [step, setStep] = useState(0);
  const [uploadType, setUploadType] = useState();
  const [uploadModalText, setUploadModalText] = useState('');
  const [data, setData] = useState();
  const [total, setTotal] = useState();
  const [created, setCreated] = useState([]);
  const [exists, setExists] = useState([]);
  const [failed, setFailed] = useState([]);
  const [prevGroup, setprevGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const { actions } = useUi();
  const { state: storeState } = useStore();
  const { user, institute } = storeState;
 
  showUploadType(uploadModalText)
 
  const handleGroupSubmit = (value) => {
    setCreated([])
    setExists([])
    setFailed([])
    if (loading) return;
    if (!data) {
      actions.alert("Please select a file", "error");
      return;
    }
    
    if (value[0].length != 1) {
      actions.alert(
        "Please select a file according to Group template syntax",
        "error"
      );
      return;
    }
    value = value.filter((e, idx) => idx != 0);

    value.map((data, idx) => {
      value[idx] = data[0];
    });

    if (value.length !== new Set(value).size) {
      actions.alert("File contains duplicate group names", "error");
      return;
    }

    setLoading(true);

    let counter = 0;
    value.map(async (data) => {
      try {
        let name = data;
        let groups = (
          await db
            .collection("Institution")
            .doc(user._code)
            .collection("groups")
            .where("name", "==", name)
            .get()
        ).docs.map((el) => el.data());
        if (groups.length > 0) {
          setExists((prev) => [...prev, name]);
        } else {
          await FirebaseHelpers.createGroup.execute({
            user,
            group: {
              name,
            },
          });
          setCreated((prev) => [...prev, name]);
        }
        counter = counter + 1;
        if (value.length == counter) {
          setTotal(counter);
          setLoading(false);
          setStep(2);
          setUploadModalText(`${uploadModalText} summery`)
        }
      } catch (error) {
        actions.alert(error.message, "error");
        setLoading(false);
      }
    });
  };
  
  const handleStaffSubmit = async (value) => {
    setCreated([])
    setExists([])
    setFailed([])
    setUploadModalText("Excel Upload Staff")
   console.log("staff")
console.log(value)
    let validation = false;
    const groups = await FirebaseHelpers.fetchGroups.execute({ user });
    if (loading) return;
    if (!data) {
      
      actions.alert("Please select a file", "error");
      return;
    }

    if (value[0].length != 5) {
      actions.alert(
        "Please select a file according to Staff template syntax",
        "error"
      );
      return;
    } else {
      value[0].map((e, idx) => {
        if (idx == 0) {
          if (e != "name") {
            validation = true;
          }
        }
        if (idx == 1) {
          if (e != "type") {
            validation = true;
          }
        }
        if (idx == 2) {
          if (e != "mail") {
            validation = true;
          }
        }
        if (idx == 3) {
          if (e != "password") {
            validation = true;
          }
        }
        if (idx == 4) {
          if (e != "group") {
            validation = true;
          }
        }
      });
    }

    value.map(async (data) => {
      if (data[1]?.toString() == "admin") {
        validation = true;
      }
    });
    if (validation) {
      actions.alert(
        "Please select a file according to Staff template syntax",
        "error"
      );
      validation = false;
      setData();
      return;
    }
    setLoading(true);

    let counter = 0;
    value = value.filter((e, idx) => idx != 0);
    value = value.filter((e)=> !e.length==0);
    
    console.log({ v: value });
   
    value.map(async (data) => {

  
        let _name = data[0]?.toString();
        let _type = data[1]?.toString();
        let _email = data[2]?.toString();
        let _password = data[3]?.toString();
     
        let _group = groups?.filter((e) => e.name == data[4]);
        console.log(`group is ${_group}`)
        if (_type == "manager") {
          _type = "mngr";
        } else if (_type == "coordinator") {
          _type = "crdntr";
        } else if (_type == "general staff") {
          _type = "gstaff";
        }
  
        const payload = {
          name: _name,
          type: _type,
          email: _email,
          selectedGroups: _group,
        };
        
        await FirebaseHelpers.createStaff
          .execute({
            user,
            institute,
            staff: {
              name: _name,
              type: _type,
              email: _email,
              selectedGroups: [_group[0]?.id==undefined?data[4]:_group[0]?.id],
              password: _password,
            },
            
          })
          .then(() => {
           
            setCreated((prev) => [...prev, payload]);
          })
          .catch((e) => {
           
            const _payload = {
              name: _name,
              type: _type,
              email: _email,
              selectedGroups: _group,
              error: e.message,
            };
            if(e.code === 'auth/email-already-in-use'){
              setExists((prev) => [...prev, _payload]);
            } else {
              setFailed((prev) => [...prev, _payload])
            }
           
            
            console.log(e)
          });
  
        counter = counter + 1;
        if (value.length == counter) {
          setTotal(counter);
          setLoading(false);
          setStep(2);
          setUploadModalText(`${uploadModalText} summery`)
        }
      


     
    });
  };
  const handleKidSubmit = async (value) => {
    setCreated([])
    setExists([])
    setFailed([])



    let validation = false;
    if (loading) return;
    if (!data) {
      actions.alert("Please select a file", "error");
      return;
    }
    if (value[0].length != 5) {
      actions.alert(
        "Please select a file according to Kids template syntax",
        "error"
      );
      return;
    } else {
      value[0].map((e, idx) => {
        if (idx == 0) {
          if (e != "name") {
            validation = true;
          }
        }
        if (idx == 1) {
          if (e != "username") {
            validation = true;
          }
        }
        if (idx == 2) {
          if (e != "password") {
            validation = true;
          }
        }
        if (idx == 3) {
          if (e != "group") {
            validation = true;
          }
        }
        if (idx == 4) {
          if (e != "assignDays") {
            validation = true;
          }
        }
      });
    }
    console.log({ v: validation });
    if (validation) {
      actions.alert(
        "Please select a file according to Kids template syntax",
        "error"
      );
      validation = false;
      return;
    }
    setLoading(true);
    let counter = 0;
    const groups = await FirebaseHelpers.fetchGroups.execute({ user });
    
    value = value.filter((e, idx) => idx != 0);

    value.map(async (data) => {
      let _name = data[0].toString();
      let _username = data[1].toString();
      let _password = data[2]?.toString();
  
      let _group = groups.filter((e) => e.name === data[3]);
groups.map(e=>{console.log(e.name)})
      const arrayToObject1 = _group[0];
      let _assigned_days = data[4];

      
    
      
      const _arr =[_assigned_days?.split(",")];
      console.log(_arr)
      const assignedDaysArray = new Array(7).fill(null).map((el, index) => {
        const exists = _arr.find((day) => day == index);
        return !!exists;
      });

      const payload = {
        password: _password,
        name: _name,
        username: _username.trim().toLowerCase(),
        confirmPassword: _password,
        group: arrayToObject1,
        joinDate: new Date(),
        assigned_days: assignedDaysArray,
      };
      console.log({
        p: payload,
      });
      const kidId = nanoid(6);

      await FirebaseHelpers.createKid
        .execute({
          user,
          institute,
          kid: {
            kidId,
            ...payload,
          },
        })
        .then(() => {
          setCreated((prev) => [...prev, payload]);
        })
        .catch((error) => {
          
          const _payload = {
            password: _password,
            name: _name,
            username: _username,
            confirmPassword: _password,
            group: arrayToObject1,
            joinDate: new Date(),
            assigned_days: assignedDaysArray,
            error: error,
          };
         if(error=="Kid with same name already exists, Kindly choose a different name"){
          setExists((prev) => [...prev, _payload]);
         } else {
          setFailed((prev) => [...prev, _payload]);
         }
        
        });

      counter = counter + 1;
      if (value.length == counter) {
        setTotal(counter);
        setStep(2);
        setLoading(false);
        setUploadModalText(`${uploadModalText} summery`)
      }
    });
  };

  const handleSubmit = (value) => {
    setData(value);
  };

  const classes = useStyles();
  return (
    <Fragment>
      {step == 0 && (
        <div className={classes.gridContainer}>
          <Grid container spacing={4}>
            <Grid item className={classes.gridItem} md={4}>
              <div
                className={classes.box}
                onClick={() => {
                
                  setUploadType("staff");
                  setUploadModalText("staff")
                  setStep(1);
                }}
              >
                <div
                  className={clsx([classes.roundContainer, classes.staffColor])}
                >
                  <img src={StaffIcon} />
                </div>
                <Typography className={classes.buttonText}>
                  <FormattedMessage id="upload_staff" />
                </Typography>
              </div>
            </Grid>
            <Grid item className={classes.gridItem} md={4}>
              <div
                className={classes.box}
                onClick={() => {
                  setUploadType("kids");
                  setUploadModalText("kids")
                  setStep(1);
                }}
              >
                <div
                  className={clsx([classes.roundContainer, classes.kidColor])}
                >
                  <img src={KidIcon} />
                </div>
                <Typography className={classes.buttonText}>
                  <FormattedMessage id="upload_kids" />
                </Typography>
              </div>
            </Grid>
            <Grid item className={classes.gridItem} md={4}>
              <div
                className={classes.box}
                onClick={() => {
                  setUploadType("groups");
                  setUploadModalText("groups")
                  setStep(1);
                }}
              >
                <div
                  className={clsx([classes.roundContainer, classes.groupColor])}
                >
                  <img src={GroupIcon} />
                </div>
                <Typography className={classes.buttonText}>
                  <FormattedMessage id="upload_groups" />
                </Typography>
              </div>
            </Grid>
          </Grid>
        </div>
      )}
      {step == 1 && (
        <>
          <div className={classes.mainContainer}>
            <div className={classes.dottedDiv}>
              <DragAndDrop handleSubmit={handleSubmit} />
            </div>
            {uploadType == "groups" && (
              <CsvDownloader
                extension=".csv"
                columns={groupHeader}
                filename={`groups.csv`}
                datas={groupData}
              >
                <Button className={classes.pinkButton}>
                  <FormattedMessage id="download_template" />
                </Button>
              </CsvDownloader>
            )}
            {uploadType == "staff" && (
              <CsvDownloader
                extension=".csv"
                columns={staffHeader}
                filename={`staff.csv`}
                datas={staffData}
              >
                <Button className={classes.pinkButton}>
                  <FormattedMessage id="download_template" />
                </Button>
              </CsvDownloader>
            )}
            {uploadType == "kids" && (
              <CsvDownloader
                extension=".csv"
                columns={kidHeader}
                filename={`kids.csv`}
                datas={kidData}
              >
                <Button className={classes.pinkButton}>
                  <FormattedMessage id="download_template" />
                </Button>
              </CsvDownloader>
            )}
          </div>
          <Grid container spacing={2}>
            <Grid item xs={6} justifyContent="center">
              <div className={classes.summaryHeader}>
                <Button
                  className={classes.cancelButton}
                  onClick={() => {
                    
                    setUploadModalText('')
                    setStep(0)}}
                >
                  <FormattedMessage id="back" />
                </Button>
              </div>
            </Grid>
            <Grid item xs={6} justifyContent="center">
              <div className={classes.summaryHeader}>
               
                {/* <CButton
                  className={classes.uploadButton}
                  loading={loading}
                  disable={!data}
                  onClick={() => {
                    {
                      uploadType == "groups" && handleGroupSubmit(data);
                    }
                    {
                      uploadType == "staff" && handleStaffSubmit(data);
                    }
                    {
                      uploadType == "kids" && handleKidSubmit(data);
                    }
                  }}
                >
                  <FormattedMessage id="upload" />
                </CButton> */}
                <CButton 
                 className={classes.uploadButton}
                 loading={loading}
                 disable={!data}
                 onClick={()=>{
                  {
                    uploadType == "groups" && handleGroupSubmit(data);
                  }
                  {
                    uploadType == "staff" && handleStaffSubmit(data);
                  }
                  {
                    uploadType == "kids" && handleKidSubmit(data);
                  }
                  setUploadModalText(`${uploadModalText} summery`)
                  
                 }}>
 <FormattedMessage id="apply" />
                </CButton>
              </div>
            </Grid>
          </Grid>
        </>
      )}
      {step == 2 && (
        <>
          <div className={classes.summaryHeader}>
            <div
              className={classes.roundContainer}
              style={{ backgroundColor: "#685BE7" }}
            >
              <img src={Tick} />
            </div>
            <Typography className={classes.summaryTitle}>
              <FormattedMessage id="Read Succed" />
            </Typography>
          </div>
          <div className={classes.summaryDiv}>
            <div className={classes.summaryTopDiv}>
              {uploadType == "groups" && (
                <>
                 <Typography className={classes.summaryTitle}>
                    <FormattedMessage id="groups" />
                  </Typography>
                  <Typography className={classes.greyText}>
                    <FormattedMessage id="total_groups_in_file: " />
                    {total} {" , "}
                    <FormattedMessage id="Will_Be_Created: " />
                    {created?.length} {" , "}
                    <FormattedMessage id="Already_Existing: " />
                    {exists?.length} {" , "}
                    <FormattedMessage id="Will_Fail: " />
                    {failed?.length}
                  </Typography>
                </>
              )}
              {uploadType == "staff" && (
                <>
             
                  <Typography className={classes.summaryTitle}>
                    <FormattedMessage id="staff" />
                  </Typography>
                  <Typography className={classes.greyText}>
                    <FormattedMessage id="total_staff_in_file: " />
                    {total} {" , "}
                   
                    <FormattedMessage id="Will_Be_Created: " />
                    {created?.length} {" , "}
                    <FormattedMessage id="Already_Existing: " />
                    {exists?.length} {" , "}
                    <FormattedMessage id="Will_Fail: " />
                    {failed?.length}
                  </Typography>
                  
                </>
              )}
              {uploadType == "kids" && (
                <>
                 <Typography className={classes.summaryTitle}>
                    <FormattedMessage id="kids" />
                  </Typography>
                  <Typography className={classes.greyText}>
                    <FormattedMessage id="total_kids_in_file: " />
                    {total} {" , "}
                    <FormattedMessage id="Will_Be_Created: " />
                    {created?.length} {" , "}
                   
                    <FormattedMessage id="Already_Existing: " />
                    {exists?.length} {" , "}
                    <FormattedMessage id="Will_Fail: " />
                    {failed?.length}
                  </Typography>
                </>
              )}
            </div>
            {uploadType == "groups" && (
              <div className={classes.summaryMainDiv}>
                <Typography style={{ fontWeight: 600 }}>
                  {/* <FormattedMessage id="created: " /> */}
                </Typography>
           <ol>
           {created.map((el, idx) => {
                  return (
                    <li   className={classes.greyText}>
                    <Typography
                      className={classes.greyText}
                      style={{ fontSize: 16 }}
                    >
                      {el}
                    </Typography>
                    </li>
                  );
                })}
               
               
                {exists.map((el, idx) => {
                  return (
                    <li  className={classes.greyText}>
  <Typography
                      className={classes.greyText}
                      style={{ fontSize: 16, color:"red" }}
                    >
                      {` Already Exist! ${el}`}
                    </Typography>
                    </li>
                  
                  );
                })}
           </ol>
              
              </div>
            )}
            {uploadType == "staff" && (
              <div className={classes.summaryMainDiv}>
                <Typography style={{ fontWeight: 600 }}>
                  {/* <FormattedMessage id="created: " /> */}
                </Typography>
                <ol >
                {created.map((el, idx) => {
                  if (el.type == "guide")
                    return (

                      <li 
                      className={classes.greyText}
                      style={{ fontSize: 16 }}>

<Typography
                        className={classes.greyText}
                        style={{ fontSize: 16 }}
                      >
                        {
                          "Email: " +
                          el.email +
                          ", Name: " +
                          el.name +
                          ", Group: " +
                          el.selectedGroups[0]?.name +
                          ", Role: " +
                          el.type}
                      </Typography>
                      </li>
                     
                    );
                  else
                    return (
                     <li 
                     className={classes.greyText}
                     style={{ fontSize: 16}}>
                       <Typography
                        className={classes.greyText}
                        style={{ fontSize: 16 }}
                      >
                        { +
                          "Email: " +
                          el.email +
                          ", Name: " +
                          el.name +
                          ", Role: " +
                          el.type}
                      </Typography>
                     </li>
                    );
                })}
                {exists.map((el, idx) => {
                  if (el.type == "guide")
                    return (
                      <li 
                      className={classes.greyText}
                      style={{ fontSize: 16}}>
                        <Typography
                        className={classes.greyText}
                        style={{ fontSize: 16, color:'red' }}
                      >
                        {/* {`${idx + 1}.` +
                          "Email: " +
                          el.email +
                          ", Name: " +
                          el.name +
                          ", Group: " +
                          el.selectedGroups[0]?.name +
                          ", Role: " +
                          el.type +
                          ", Error: " +
                          el.error} */}
                          {`Already Exist! ${el.email}`}
                      </Typography>
                      </li>
                    );
                  else
                    return (
                      <li    className={classes.greyText}  style={{ fontSize: 16}} >
<Typography
                        className={classes.greyText}
                        style={{ fontSize: 16 , color:'red'}}
                      >
                        {/* {`${idx + 1}.` +
                          "Email: " +
                          el.email +
                          ", Name: " +
                          el.name +
                          ", Role: " +
                          el.type +
                          "," +
                          el.error} */}
                            {`${idx + 1}.` + el.email + 
                         
                         el.error}
                      </Typography>
                    </li>
                    );
                })}
                {failed.map((el, idx) => {
                  if (el.type == "guide")
                    return (
                      <li 
                      className={classes.greyText}
                      style={{ fontSize: 16}}>
                        <Typography
                        className={classes.greyText}
                        style={{ fontSize: 16, color:'red' }}
                      >
                        {/* {`${idx + 1}.` +
                          "Email: " +
                          el.email +
                          ", Name: " +
                          el.name +
                          ", Group: " +
                          el.selectedGroups[0]?.name +
                          ", Role: " +
                          el.type +
                          ", Error: " +
                          el.error} */}
                          {`Will Fail ! ${el.email}, Cause : ${el.error}`}
                      </Typography>
                      </li>
                    );
                  else
                    return (
                      <li 
                      className={classes.greyText}
                      style={{ fontSize: 16,}}>
<Typography
                        className={classes.greyText}
                        style={{ fontSize: 16 }}
                      >
                        {/* {`${idx + 1}.` +
                          "Email: " +
                          el.email +
                          ", Name: " +
                          el.name +
                          ", Role: " +
                          el.type +
                          "," +
                          el.error} */}
                            {`${idx + 1}.` + el.email + 
                         
                         el.error}
                      </Typography>
                      </li>
                    );
                })}
                </ol>
               
                <Typography style={{ fontWeight: 600 }}>
                  {/* <FormattedMessage id="failed: " /> */}
                </Typography>
                
                
              </div>
            )}
            {uploadType == "kids" && (
              <div className={classes.summaryMainDiv}>
                <Typography style={{ fontWeight: 600 }}>
                  {/* <FormattedMessage id="created: " /> */}
                </Typography>
                <ol>
                {created.map((el, idx) => {
                  return (
                    <li className={classes.greyText}>
                    <Typography
                      className={classes.greyText}
                      style={{ fontSize: 16 }}
                    >
                      {`${idx + 1}.` +
                        "Name: " +
                        el.name +
                        ", UserName: " +
                        el.username +
                        ", Group: " +
                        el.group?.name}
                    </Typography>
                    </li>
                  );
                })}
                
                
                {exists.map((el, idx) => {
                  return (
                    <li  className={classes.greyText}>
<Typography
                      className={classes.greyText}
                      style={{ fontSize: 16, color:"red"}}
                    >
                      {` Already Exist! ${el.name}` 
                        }
                    </Typography>
                    </li>
                    
                  );
                })}
                {failed.map((el, idx) => {
                  return (
                    <li  className={classes.greyText}>
<Typography
                      className={classes.greyText}
                      style={{ fontSize: 16, color:"red"}}
                    >
                      {` Will Fail! ${el.error}` 
                        }
                    </Typography>
                    </li>
                    
                  );
                })}
                </ol>
                
              </div>
            )}
          </div>
          <Divider />
          <Grid container spacing={2} flexDirection="row" justifyContent="space-between" style={{padding:"20px"}} >
          <Grid item >
           
           
           
           <Button
                  className={classes.cancelButton}
                  onClick={() => {
                    setUploadModalText(uploadType)
                    setStep(1)}}
                >
                  <FormattedMessage id="back" />
                  </Button>
          
 
             </Grid>
            <Grid item >
           
          
          
            <Button onClick={handleClose} className={classes.uploadButton}>
              <FormattedMessage id="upload" />
            </Button>
          

            </Grid>
            
            </Grid>
          
        </>
      )}
    </Fragment>
  );
};

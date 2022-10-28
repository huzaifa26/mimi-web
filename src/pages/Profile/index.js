import React, { Fragment } from 'react';
import { makeStyles, Tabs, Tab, AppBar, Box, alpha } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Links, MenuSingle, Button } from '../../components';

import Icons from '../../components/Icons';
import { getPageStyles, getSectionHeaderStyles } from '../../utils/helpers';
import clsx from 'clsx';
import { ChangePassword } from './tabs/password';
import { Profile as ProfileTab } from './tabs/profile';
import { useStore } from '../../store';
import { LANGUAGE_MAPPING } from '../../utils/constants';

const options = [
    {
        id: 'en',
        label: 'English',
    },
    {
        id: 'heb',
        label: 'Hebrew',
    },
];


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            style={{
                flex: 1,
                overflow: 'hidden',
            }}
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box
                    style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                    p={2}
                >
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export const Profile = React.memo(() => {
    const classes = useStyles();
    const { actions: storeActions, setState: setStoreState, state: storeState } = useStore();

    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const links = [
        {
            ref: '/profile',
            title: <FormattedMessage id="profile" />,
        },
    ];

    const actionBar = (
        <div className={classes.default_headerSection_container}>
            <div className={classes.default_headerSection_pageTitle}>
                <Links links={links} />
            </div>
            <div className={classes.default_headerSection_actionsContainer}>
                <Button startIcon={Icons.logout} className={classes.buttonSignout} onClick={() => storeActions.handleSignOut()}>
                    <FormattedMessage id="sign_out" />
                </Button>

                <MenuSingle
                    btnProps={{
                        startIcon: Icons.language,
                        className: classes.buttonChangeLanguage,
                    }}
                    list={options}
                    label={<FormattedMessage id="change_language" />}
                    handleChange={value => {
                        const dir = value.id === LANGUAGE_MAPPING.ENGLISH ? 'ltr' : 'rtl';

                        const bodyEl = document.getElementsByTagName('html')[0];
                        bodyEl.setAttribute('lang', value.id);
                        bodyEl.setAttribute('dir', dir);

                        localStorage.setItem('language', value.id);
                        localStorage.setItem('orientation', dir);

                        setStoreState(prev => ({ ...prev, language: value.id, orientation: dir }));

                        // to change the website title as the lnguage
                        const language = localStorage.getItem('language');
                        if(language === 'heb'){
                            document.title = 'מימי';
                        }else{
                            document.title = 'Mimi';
                        }
                    }}
                    defaultValue={options.find(el => el.id === storeState.language)}
                />
            </div>
        </div>
    );

    return (
        <Fragment>
            <section className={clsx([classes.default_page_root])}>
                {actionBar}
                <div className={clsx([classes.default_page_root, classes.default_page_Bg1, classes.default_page_removePadding])}>
                    <AppBar position="static" className={classes.appBarOveride}>
                        <Tabs value={value} onChange={handleChange}>
                            <Tab disableRipple className={classes.tabBarOveride} label={<FormattedMessage id={'profile'} />} {...a11yProps(0)} />
                            <Tab disableRipple className={classes.tabBarOveride} label={<FormattedMessage id={'password'} />} {...a11yProps(1)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0}>
                        <ProfileTab />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <ChangePassword />
                    </TabPanel>
                </div>
            </section>
        </Fragment>
    );
});

const useStyles = makeStyles(theme => {
    return {
        ...getSectionHeaderStyles(theme),
        ...getPageStyles(theme),
        page: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        buttonSignout: {
            color: '#000 !important',
            background: `${alpha(`#FF1111`, 0.3)} !important`,
            paddingLeft: '20px !important',
            paddingRight: '20px !important',
        },
        buttonChangeLanguage: {
            color: '#000 !important',
            background: `${alpha(`#A600D4`, 0.1)} !important`,
            paddingLeft: '20px !important',
            paddingRight: '20px !important',
        },
        appBarOveride: {
            background: 'transparent !important',
            boxShadow: 'none',
            '& .MuiTabs-indicator': {
                background: '#685BE7',
            },
            '& .MuiTab-root': {
                marginTop: 6,
                marginBottom: 6,
                minWidth: 100,
                textTransform: 'capitalize',
                background: 'transparent',
                color: '#000',
                fontWeight: 'bold',

                '&.Mui-selected': {
                    color: `#685BE7`,
                },
            },
        },
    };
});

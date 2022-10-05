import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { getTypographyStyles } from '../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getTypographyStyles(theme),
        active: {
            color: '#000 !important',
        },
        link: {
            color: '#C9C9C9',
            textDecoration: 'none',
        },
        container: {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            [theme.breakpoints.only('xs')]: {},
        },
    };
});

export const Links = ({ links }) => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            {links.map((el, idx) => {
                if (links.length === idx + 1) {
                    return (
                        <Link className={clsx(classes.link, classes.active)} to={el.ref}>
                            <Typography className={clsx([classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize])}>
                                {el.title}
                            </Typography>
                        </Link>
                    );
                } else {
                    return (
                        <Fragment>
                            <Link className={classes.link} to={el.ref}>
                                <Typography className={clsx([classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize])}>
                                    {el.title}
                                </Typography>
                            </Link>
                            <ArrowForwardIosIcon
                                style={{
                                    marginLeft: 4,
                                    marginRight: 4,
                                    fontSize: 18,
                                    color: `#C9C9C9`,
                                }}
                            />
                        </Fragment>
                    );
                }
            })}
        </div>
    );
};

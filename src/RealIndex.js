/* eslint-disable import/no-anonymous-default-export */
/*!

=========================================================
* Argon Dashboard React - v1.2.2
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, {useEffect, useState} from "react";
import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "assets/plugins/helixa/css/helixa.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import "./App.css"

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";

import {ConfigProvider} from "antd";
import Palette from "./utils/Palette";

export default function (props) {

    const [kicked, setKicked] = useState(true)

    useEffect(() => {
        if (localStorage.getItem('super_token') !== null) {
            setKicked(false)
        }
    }, []);

    return <div>
        <ConfigProvider
            theme={{
                cssVar: true,
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: Palette.CATALYST_PINK,
                    fontFamily: 'Open Sans, sans-serif',
                    colorBgContainer: "#282828",
                    zIndexPopupBase: 1073 // Z-Index modal react-bootstrap = 1072
                },
                components: {
                    Table: {
                        headerBg: '#00000',
                        borderColor: '#FFF'
                    },
                    Form: {
                        labelColor: '#FFF'
                    },
                    Input: {
                        activeBg: "#282828",
                    },
                }
            }}
        >
            <BrowserRouter basename="/">
                <Switch>
                    {
                        kicked ?
                            <>
                                <Route path="*" render={(props) => <AuthLayout {...props} />}/>
                                {/*<Redirect from="*" to="/login" />*/}
                                {/*<Route path={"*"} component={Login}/>*/}
                                {/*<Route from="*" to="/auth/login"/>*/}
                            </>
                            :
                            <>
                                <Route path="/" render={(props) => <AdminLayout {...props} />} />
                                {/*<Route path={"*"} component={Dashboard}/>*/}
                                {/*<Route from="*" to="/admin/admin"/>*/}
                            </>
                    }
                </Switch>
            </BrowserRouter>
        </ConfigProvider>
    </div>
}



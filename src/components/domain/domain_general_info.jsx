// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import moment from 'moment';

import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import CompanyStore from '../../stores/company_store.jsx';
import UserStore from '../../stores/user_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

import Constant from '../../utils/constants.jsx';

export default class DomainGeneralInfo extends React.Component {
    constructor(props) {
        super(props);

        this.getMXRecord = this.getMXRecord.bind(this);
        this.renovationDate = this.renovationDate.bind(this);
        this.getCompany = this.getCompany.bind(this);
        this.isGlobalAdmin = UserStore.isGlobalAdmin();

        this.state = {
            mx: null,
            date: this.renovationDate()
        };
    }
    componentWillMount() {
        const domain = this.props.domain;
        this.getMXRecord(domain);
        this.getCompany(domain.attrs.businessCategory);
    }
    getMXRecord(domain) {
        const self = this;

        domain.checkMxRecord((err, data) => {
            if (err) {
                return self.setState({
                    mx: err
                });
            }

            return self.setState({
                mx: data.entry
            });
        });
    }
    getCompany(id) {
        const company = CompanyStore.getCompanyById(id);
        if (company) {
            this.setState({
                company: company.name
            });
        } else {
            Client.getCompany(id).then((data) => {
                this.setState({
                    company: data.name
                });
            }).catch((error) => {
                this.setState({
                    error: {
                        message: error.message,
                        type: Constant.MessageType.ERROR
                    }
                });
            });
        }
    }
    renovationDate() {
        const timestamp = moment(this.props.domain.attrs.zimbraCreateTimestamp);
        const now = moment();
        timestamp.year(now.year());
        if (timestamp.isBefore(now)) {
            timestamp.add(1, 'year');
        }

        return timestamp.format('DD/MM/YYYY');
    }
    render() {
        const domain = this.props.domain;
        let editDomainButton = null;
        const infoBody = (
            <div className='row'>
                <div className='col-md-12'>
                    <div
                        id={`domain-${domain.id}`}
                        className='domain-info'
                    >
                        <h4>
                            <span className='domain-name'>{`@${domain.name}`}</span>
                            <br/>
                            <small/>
                        </h4>
                        <p>
                            <a
                                className='account-name'
                                onClick={(e) => Utils.handleLink(e, `/companies/${domain.attrs.businessCategory}`, this.props.location)}
                            >
                                {this.state.company}
                            </a>
                        </p>
                        <ul className='list-unstyled'>
                            <li>
                                <strong>{'MX Record: '}</strong>
                                {this.state.mx}
                            </li>
                            <li>
                                <strong>{'Próxima renovación: '}</strong>
                                {this.state.date}
                            </li>
                            <li>
                            </li>
                        </ul>
                        <ul className='list-inline list-unstyled'>
                            <li>
                                <StatusLabel
                                    classes='btn btn-md btn-info'
                                    children='Anual'
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );

        if (this.isGlobalAdmin) {
            editDomainButton = [{
                label: 'Editar',
                props: {
                    className: 'btn btn-default btn-xs',
                    onClick: (e) => Utils.handleLink(e, `/domains/${this.props.params.id}/edit`, this.props.location)
                }
            }];
        }

        return (
            <Panel
                title='Información General'
                btnsHeader={editDomainButton}
                children={infoBody}
            />
        );
    }
}

DomainGeneralInfo.propTypes = {
    domain: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired
};

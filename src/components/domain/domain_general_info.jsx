// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import {getDnsInfo} from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

export default class DomainGeneralInfo extends React.Component {
    constructor(props) {
        super(props);

        this.getMXRecord = this.getMXRecord.bind(this);

        this.state = {
            mx: null
        };
    }
    componentWillMount() {
        this.getMXRecord();
    }
    getMXRecord() {
        getDnsInfo(
            this.props.domain.name,
            (data) => {
                this.setState({
                    mx: data.mx
                });
            },
            (err) => {
                this.setState({
                    mx: err
                });
            }
        );
    }
    render() {
        const domain = this.props.domain;
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
                                onClick={(e) => Utils.handleLink(e, `/accounts/${domain.id_empresa}`, this.props.location)}
                            >
                                {'Nombre de la Empresa'}
                            </a>
                        </p>
                        <ul className='list-unstyled'>
                            <li>
                                <strong>{'MX Record: '}</strong>
                                {this.state.mx}
                            </li>
                            <li>
                                <strong>{'Próxima renovación: '}</strong>
                                {'19/10/2016'}
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

        const editDomainButton = [{
            label: 'Editar',
            props: {
                className: 'btn btn-default btn-xs',
                onClick: (e) => Utils.handleLink(e, `/domains/${this.props.params.id}/edit`, this.props.location)
            }
        }];

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

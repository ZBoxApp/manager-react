//import * as Utils from '../../utils/utils.jsx';
import React from 'react';
import Panel from '../panel.jsx';
import CreateDomainForm from './multiform/create_domain_form.jsx';
import MailCleanerForm from './multiform/mailcleaner_form.jsx';
import DNSZoneForm from './multiform/dns_form.jsx';
import DomainStore from '../../stores/domain_store.jsx';
import EventStore from '../../stores/event_store.jsx';
import MessageBar from '../message_bar.jsx';
import UserStore from '../../stores/user_store.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class CreateDomain extends React.Component {
    constructor(props) {
        super(props);

        this.getNextStep = this.getNextStep.bind(this);
        this.showMessage = this.showMessage.bind(this);

        this.isGlobalAdmin = UserStore.isGlobalAdmin();
        this.multiform = window.manager_config.multiFormDomain;
        let total = 1;

        if (this.multiform) {
            if (this.multiform.hasMailCleaner) {
                total++;
            }

            if (this.multiform.hasDNSZone) {
                total++;
            }
        }

        this.state = {
            step: 1,
            total,
            isGlobalAdmin: this.isGlobalAdmin
        };
    }

    getNextStep(attrs) {
        const states = {};

        if (attrs.domain) {
            states.domain = attrs.domain;
        }

        states.step = attrs.step;

        this.setState(states);
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.message,
            type: attrs.typeError
        });
    }

    componentDidMount() {
        DomainStore.addNextStepListener(this.getNextStep);
        EventStore.addMessageListener(this.showMessage);
        GlobalActions.emitEndLoading();
    }

    componentWillUnmount() {
        DomainStore.removeNextStepListener(this.getNextStep);
        EventStore.removeMessageListener(this.showMessage);
    }

    render() {
        let form = null;
        let titleForm = null;
        const progress = `${this.state.step}/${this.state.total}`;
        let progressForm = null;
        const width = ((100 / this.state.total) * this.state.step);
        const progressSize = {
            width: `${width}%`
        };
        let error = null;
        let actions = null;

        if (this.state.isGlobalAdmin) {
            if (this.state.error) {
                error = (
                    <MessageBar
                        message={this.state.error}
                        type={this.state.type}
                        autoclose={true}
                    />
                );
            }

            let step = this.state.step;

            if (!this.multiform.hasMailCleaner && step > 1) {
                ++step;
            }

            switch (step) {
            case 1:
                form = (
                    <CreateDomainForm
                        params={this.props.params}
                        state={this.state}
                    />
                );
                titleForm = 'Creación de Dominio';
                break;
            case 2:
                form = <MailCleanerForm state={this.state}/>;
                titleForm = 'Asignación del Dominio al MailCleaner';
                break;
            case 3:
                form = <DNSZoneForm state={this.state}/>;
                titleForm = 'Asignación de la Zona DNS';
                break;
            }

            //onClick: (e) => Utils.handleLink(e, backUrl)
            actions = [
                {
                    label: 'Cancelar',
                    props: {
                        className: 'btn btn-default btn-xs'
                    }
                }
            ];

            if (this.state.total > 1) {
                progressForm = (
                    <div className='progress'>
                        <div
                            className={'progress-bar progress-bar-info progress-bar-striped active text-center step'}
                            style={progressSize}
                        >
                            <span className='progress-text'>{`${titleForm} - ${progress}`}</span>
                        </div>
                    </div>
                );
            }
        }

        if (!this.state.isGlobalAdmin) {
            form = (
                <div className='text-center'>
                    <h4>
                        {'Lo sentimos pero usted no tiene permiso para crear dominios.'}
                    </h4>
                </div>
            );
        }

        return (
            <div>
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 panel-with-tabs'>
                            <Panel
                                title={'Agregar Dominio'}
                                classHeader={'forum-box'}
                                btnsHeader={actions}
                            >
                                {error}
                                {progressForm}
                                {form}
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

CreateDomain.propTypes = {
    params: React.PropTypes.object.isRequired
};


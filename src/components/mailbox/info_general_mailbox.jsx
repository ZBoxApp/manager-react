import React from 'react';
import PropTypes from 'prop-types';
import Button from '../button.jsx';
import StatusLabel from '../status_label.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';
import MailboxStore from '../../stores/mailbox_store.jsx';

export default class BlockGeneralInfoMailbox extends React.Component {
    constructor(props) {
        super(props);

        this.handleWatchDomain = this.handleWatchDomain.bind(this);
        this.getDomain = this.getDomain.bind(this);

        this.data = this.props.data;
        this.domain = null;

        this.state = {};
    }

    componentDidMount() {
        this.getDomain();
    }

    getDomain() {
        const domain = Utils.getDomainFromString(this.data.name);

        Client.getDomain(domain, (data) => {
            MailboxStore.emitDomainId(data.id);
            this.setState({
                hasDomain: true,
                domainData: data
            });
        }, (error) => {
            GlobalActions.emitMessage({
                error: error.message,
                typeError: error.type
            });
        });
    }

    handleWatchDomain(e, path, location) {
        Utils.handleLink(e, path, location);
    }

    render() {
        let blockInfo = null;
        let cosName = 'Sin Plan';
        let statusCos = 'label noplan btn-xs';
        const cosID = Utils.getEnabledPlansObjectByCos(ZimbraStore.getAllCos(), this.props.data.attrs.zimbraCOSId);

        if (window.manager_config.plans[cosID.name]) {
            cosName = Utils.titleCase(cosID.name);
            statusCos = 'label btn-xs ' + window.manager_config.plans[cosID.name].statusCos;
        }

        if (this.state.hasDomain) {
            const data = this.props.data;
            const attrs = this.props.data.attrs;
            const owner = attrs.displayName ? attrs.displayName : `${attrs.givenName || attrs.cn} ${attrs.sn}`;
            const mail = data.name;

            //properties
            let AdminStatus = null;
            const description = attrs.description;
            const mailhost = attrs.zimbraMailHost;
            const archive = data.archiveEnabled ? attrs.zimbraArchiveAccount : data.archiveEnabled;
            const isAdminDelegated = attrs.zimbraIsDelegatedAdminAccount === 'TRUE';
            if (isAdminDelegated) {
                statusCos += ' margin-left';
                AdminStatus = (
                    <StatusLabel classes={'label btn-xs btn-warning2'}>
                        {'Administrador'}
                    </StatusLabel>
                );
            }
            let btnArchive = archive;

            if (this.props.webmail) {
                btnArchive = (
                <Button
                    btnAttrs={{
                        href: this.props.webmail,
                        target: '_blank'
                    }}
                >
                    {archive}
                </Button>
                );
            }

            blockInfo = (
                <article className='account-info'>
                    <div>
                        <h4>
                            <span className='mailbox-name text-success'>{mail}</span>
                        </h4>
                        {owner && (
                            <h5>
                                {owner}
                            </h5>
                        )}
                    </div>

                    {description && (
                        <div>
                            <p>
                                {description}
                            </p>
                        </div>
                    )}

                    <div>
                        <p>
                            <strong>{'Dominio: '}</strong>
                            <Button
                                btnAttrs={{
                                    onClick: (e) => {
                                        this.handleWatchDomain(e, `/domains/${this.state.domainData.id}`, this.props.location);
                                    }
                                }}
                            >
                                {this.state.domainData.name}
                            </Button>
                        </p>
                    </div>

                    {archive && (
                        <div>
                            <p>
                                <strong>{'Archive: '}</strong>
                                {btnArchive}
                            </p>
                        </div>
                    )}

                    {mailhost && (
                        <div>
                            <p>
                                <strong>{'Mail Host'}: </strong>
                                {mailhost}
                            </p>
                        </div>
                    )}

                    <div>
                        <p>
                            <span>
                                {AdminStatus}
                                <StatusLabel classes={statusCos}>
                                    {cosName}
                                </StatusLabel>
                            </span>
                        </p>
                    </div>
                </article>
            );
        }

        return (
            blockInfo
        );
    }
}

BlockGeneralInfoMailbox.propTypes = {
    data: PropTypes.object.isRequired,
    webmail: PropTypes.string,
    location: PropTypes.object.isRequired
};

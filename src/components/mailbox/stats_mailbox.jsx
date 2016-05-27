import React from 'react';
import * as Utils from '../../utils/utils.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';
import bytesConvertor from 'bytes';

export default class BlockGeneralInfoMailbox extends React.Component {
    constructor(props) {
        super(props);
        this.date = null;
        this.status = null;
        this.className = null;
        this.lastConection = 'No se ha conectado';
        this.getMailSize = this.getMailSize.bind(this);
        this.sizeEnabled = Utils.getEnabledPlansObjectByCos(ZimbraStore.getAllCos(), this.props.data.attrs.zimbraCOSId);

        this.state = {};
    }

    getMailSize() {
        this.props.data.getMailboxSize((err, bytes) => {
            let currentSize = '0 MB';
            if (bytes) {
                currentSize = bytesConvertor(bytes);
            }

            this.setState({
                size: currentSize
            });
        });
    }

    componentWillMount() {
        this.date = Utils.dateFormatted(this.props.data.attrs.zimbraCreateTimestamp);

        switch (this.props.data.attrs.zimbraAccountStatus) {
        case 'lockout':
            this.status = 'Bloqueada';
            this.className = 'label-locked mailbox-status';
            break;
        case 'active':
            this.status = 'Activa';
            this.className = 'label-success mailbox-status';
            break;
        case 'closed':
            this.status = 'Cerrada';
            this.className = 'label-default mailbox-status';
            break;
        case 'locked':
            this.status = 'Inactiva';
            this.className = 'label-warning mailbox-status';
            break;
        default:
        }

        if (this.props.data.attrs.zimbraLastLogonTimestamp) {
            this.lastConection = Utils.dateFormatted(this.props.data.attrs.zimbraLastLogonTimestamp);
        }

        this.getMailSize();
    }

    render() {
        let size = null;
        let sizeEnaled = null;

        if (this.state.size) {
            size = this.state.size;
        }

        if (this.sizeEnabled.hasOwnProperty('attrs') && this.sizeEnabled.attrs.zimbraMailQuota) {
            const sizeOfPlan = typeof this.sizeEnabled.attrs.zimbraMailQuota === 'string' ? parseInt(this.sizeEnabled.attrs.zimbraMailQuota, 10) : this.sizeEnabled.attrs.zimbraMailQuota;

            sizeEnaled = (sizeOfPlan) ? 'Ilimitado' : bytesConvertor(sizeOfPlan);
        }

        return (
            <div>
                <div className='row'>
                    <div className='col-xs-6'>
                        <div>
                            <p>
                                <span className='center-block'>Creada El Día</span>
                                <strong>{this.date}</strong>
                            </p>
                        </div>
                    </div>
                    <div className='col-xs-6'>
                        <div>
                            <span className={this.className}>{this.status}</span>
                        </div>
                    </div>
                </div>

                <br/>

                <div className='row'>
                    <div className='col-xs-6'>
                        <div className='row'>
                            <div className='col-xs-6'>
                                {size && (
                                    <p>
                                        <span className='center-block'>Espacio Usado</span>
                                        <strong>{size}</strong>
                                    </p>
                                )}
                            </div>
                            <div className='col-xs-6'>
                                {sizeEnaled && (
                                    <p>
                                        <span className='center-block'>Espacio Total</span>
                                        <strong>{sizeEnaled}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='col-xs-6'>
                        <div>
                            <p>
                                <span className='center-block'>Última Conexión</span>
                                <strong>{this.lastConection}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

BlockGeneralInfoMailbox.propTypes = {
    data: React.PropTypes.object.isRequired
};

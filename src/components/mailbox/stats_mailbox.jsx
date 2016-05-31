//import ZimbraStore from '../../stores/zimbra_store.jsx';
import React from 'react';
import * as Utils from '../../utils/utils.jsx';
import bytesConvertor from 'bytes';
import Constants from '../../utils/constants.jsx';

export default class BlockGeneralInfoMailbox extends React.Component {
    constructor(props) {
        //this.sizeEnabled = Utils.getEnabledPlansObjectByCos(ZimbraStore.getAllCos(), this.props.data.attrs.zimbraCOSId);
        super(props);
        this.date = null;
        this.status = null;
        this.className = null;
        this.lastConection = 'No se ha conectado';
        this.getMailSize = this.getMailSize.bind(this);

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

        const status = this.props.data.attrs.zimbraAccountStatus;

        if (Constants.status[status]) {
            this.status = Constants.status[status].label;
            this.className = Constants.status[status].classes;
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

        if (this.props.data.attrs.zimbraMailQuota) {
            const attrs = this.props.data.attrs;
            const sizeOfPlan = typeof attrs.zimbraMailQuota === 'string' ? parseInt(attrs.zimbraMailQuota, 10) : attrs.zimbraMailQuota;

            sizeEnaled = (sizeOfPlan) ? bytesConvertor(sizeOfPlan) : 'Ilimitado';
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

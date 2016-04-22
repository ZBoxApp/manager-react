import React from 'react';
import * as Utils from '../../utils/utils.jsx';

export default class BlockGeneralInfoMailbox extends React.Component {
    constructor(props) {
        super(props);
        this.date = null;
        this.status = null;
        this.className = null;
        this.lastConection = 'no se ha conectado';
    }

    componentWillMount() {
        this.date = Utils.dateFormatted(this.props.data.attrs.zimbraCreateTimestamp);

        switch (this.props.data.attrs.zimbraAccountStatus) {
        case 'inactive':
            this.status = 'Desactivada';
            this.className = 'btn btn-md btn-default';
            break;
        case 'locked':
            this.status = 'Bloqueada';
            this.className = 'btn btn-md btn-primary2';
            break;
        default:
            this.status = 'Activa';
            this.className = 'btn btn-md btn-info';
            break;
        }

        if (this.props.data.attrs.zimbraLastLogonTimestamp) {
            this.lastConection = Utils.dateFormatted(this.props.data.attrs.zimbraLastLogonTimestamp);
        }
    }

    render() {
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
                        <div>
                            <p>
                                <span className='center-block'>Espacio Usado</span>
                                <strong>0 Bytes</strong>
                            </p>
                        </div>
                    </div>
                    <div className='col-xs-6'>
                        <div>
                            <p>
                                <span className='center-block'>Últimas Conexión</span>
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

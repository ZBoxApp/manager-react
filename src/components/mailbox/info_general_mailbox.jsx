import React from 'react';
import Button from '../button.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

export default class BlockGeneralInfoMailbox extends React.Component {
    constructor(props) {
        super(props);

        this.handleWatchDomain = this.handleWatchDomain.bind(this);
        this.getDomain = this.getDomain.bind(this);

        this.data = this.props.data;
        this.domain = null;

        this.state = {};
    }

    componentWillMount() {
        this.domain = this.props.data.name.split('@');
        this.domain = this.domain[this.domain.length - 1];
    }

    componentDidMount() {
        this.getDomain();
    }

    getDomain() {
        Client.getDomain(this.domain, (data) => {
            this.setState({
                hasDomain: true,
                domainData: data
            });
        }, (error) => {
            this.setState({
                error: error.message
            });
        });
    }

    handleWatchDomain(e, path, location) {
        Utils.handleLink(e, path, location);
    }

    render() {
        let blockInfo = null;

        if (this.state.hasDomain) {
            blockInfo = (
                <article>
                    <div>
                        <h4>
                            <span className='mailbox-name text-success'>{this.data.name}</span>
                        </h4>
                    </div>

                    <div>
                        <p>
                            {this.data.attrs.description}
                        </p>
                    </div>

                    <div>
                        <p>
                            <strong>{'Dominio'}: </strong>
                            <Button
                                btnAttrs={{
                                    onClick: (e) => {
                                        this.handleWatchDomain(e, `domains/${this.state.domainData.id}`, this.props.location);
                                    }
                                }}
                            >
                                {this.domain}
                            </Button>
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
    data: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
};

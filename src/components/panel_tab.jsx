import React from 'react';
import * as Utils from '../utils/utils.jsx';

export default class Panel extends React.Component {
    constructor(props) {
        super(props);

        this.changeTab = this.changeTab.bind(this);

        const tab = this.props.location.query.tab || Object.keys(this.props.tabs)[0];
        this.state = {
            tab
        };
    }

    changeTab(e, tabName) {
        e.preventDefault();

        const tab = Utils.slug(tabName);
        this.setState({tab});

        if (this.props.onClick) {
            this.props.onClick(tab);
        }
    }

    render() {
        if (this.state.tab) {
            const tabs = this.props.tabNames.map((t) => {
                const slug = Utils.slug(t);

                return (
                    <li
                        key={slug}
                        className={slug === this.state.tab ? 'active' : ''}
                    >
                        <a
                            data-toggle='tab'
                            aria-expanded='true'
                            onClick={(e) => this.changeTab(e, t)}
                        >
                            {t}
                        </a>
                    </li>
                );
            });

            return (
                <div className='hpanel'>
                    <ul className='nav nav-tabs'>
                        {tabs}
                    </ul>
                    <div className='tab-content'>
                        <div className='tab-pane active'>
                            <div className='panel-body'>
                                {this.props.tabs[this.state.tab]}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return <div/>;
    }
}

Panel.propTypes = {
    tabNames: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    tabs: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func
};

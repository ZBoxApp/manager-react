// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.
// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Panel from '../panel.jsx';

export default class CompanyInfo extends React.Component {
    render() {
        const company = this.props.company;
        const infoBody = (
            <div className='account-info'>
                <h4>
                    {company.name}
                    <br/>
                    <small>
                        {company.id}
                    </small>
                </h4>
                <p>
                    <br/><br/><br/><br/>
                </p>
            </div>
        );

        return (
            <Panel
                title='Información General'
                children={infoBody}
            />
        );
    }
}

CompanyInfo.propTypes = {
    company: React.PropTypes.object.isRequired
};

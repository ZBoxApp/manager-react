import React from 'react';

import * as Utils from '../../utils/utils.jsx';

export default class NotFound404 extends React.Component {
    render() {
        const clouds = [];
        const totalClouds = Utils.randomRange(30, 20);
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        for (let i = 0; i < totalClouds; i++) {
            const topStyle = Utils.randomRange(screenHeight, 80);
            const sizeCloud = Utils.randomRange(1, 5);
            const leftStyle = Utils.randomRange(screenWidth + 300, screenWidth);
            //const scale = Utils.randomRange(1, 0.1);

            clouds.push(
                (
                    <i
                        key={`cloud-${i}`}
                        style={{top: topStyle + 'px', left: leftStyle + 'px'}}
                        className={`fa fa-cloud fa-${sizeCloud}x`}
                    ></i>
                )
            );
        }

        return (
            <div className='wrapper-error'>
                <div className='zboxPlain'>
                    <i className='fa fa-paper-plane'></i>
                    <i className='fa fa-paper-plane-o underPlain'></i>
                </div>

                {clouds}
            </div>
        );
    }
}

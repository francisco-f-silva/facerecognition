import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, boxes }) => {
	const boundingBoxes = boxes.map((box, idx) => {
		return (
			<div 
				className='bounding-box'
				key={idx} 
				style={{left: box.leftCol, top: box.topRow, right: box.rightCol, bottom: box.bottomRow}} 
			/>
		);
	});

	return (
		<div className='center ma'>
			<div className='absolute mt3'>
				<img id='inputimage' alt="" src={imageUrl} width='500px' height='auto' />
				<div>{boundingBoxes}</div>
			</div>
		</div>
	);
}

export default FaceRecognition;
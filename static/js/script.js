function onSuccess() {};
function onError(error) { console.error(error); };

const configuration = {
  iceServers: [{
  urls: 'stun:stun.l.google.com:19302'
  }]
};


if (!location.hash) {
  location.hash = Math.floor(Math.random() * 10000);
}
const roomHash = location.hash.substring(1);

const drone = new ScaleDrone('Vbs6P0VgYafnQiO8');
const roomName = 'observable-' + roomHash;

let room;
let pc;


room = drone.subscribe(roomName);
room.on('open', error => {
  if (error) {
    onError(error);
  }
});

room.on('members', members => {
  console.log('MEMBERS', members);
  // if we are second, then need send offer
  const isCaller = members.length === 2;
  startWebRTC(isCaller);
});


function sendMessage(message) {
  console.log(message);
  drone.publish({
    room: roomName,
    message
  });
}

function startWebRTC(isOfferer) {
	pc = new RTCPeerConnection(configuration);

	pc.onicecandidate = event => {
		if (event.candidate) {
		  sendMessage({'candidate': event.candidate});
		}
	};

	if (isOfferer) {
		pc.onnegotiationneeded = () => {
			pc.createOffer().then(localDescCreated).catch(onError);
		}
	}

	pc.onaddstream = event => {
		remoteVideo.srcObject = event.stream;
	};



	if(navigator.mediaDevices.getDisplayMedia) {
		navigator.mediaDevices.getDisplayMedia({video: true}).then(stream => {
			localVideo.srcObject = stream;
			pc.addStream(stream);
		}, onError).catch(onError);
	}
	else if (navigator.webkitGetUserMedia) {
		navigator.webkitGetUserMedia({video: true}).then(stream => {
			localVideo.srcObject = stream;
			pc.addStream(stream);
		}, onError).catch(onError);
	}
	else if(navigator.getDisplayMedia) {
		navigator.getDisplayMedia({video: true}).then(stream => {
			localVideo.srcObject = stream;
			pc.addStream(stream);
	}, onError).catch(onError);
	}
	else if(navigator.getUserMedia) {
 
	  navigator.getUserMedia(
	    {
	      video: {
	        mediaSource: 'screen',
	      }
	    },
	     
	    function(stream) {
	      localVideo.srcObject = stream;
	      pc.addStream(stream);
	    },
	      
	    onError
	  );
	}
	else
		{alert('error')}


  	room.on('data', (message, client) => {
	    if (client.id === drone.clientId) {
			return;
	    }

    	if (message.sdp) {
    		
    		pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
				if (pc.remoteDescription.type === 'offer') {
					pc.createAnswer().then(localDescCreated).catch(onError);
				}
			}, onError);

    	} else if (message.candidate) {
    		pc.addIceCandidate(
    			new RTCIceCandidate(message.candidate), onSuccess, onError
    			);
    	}
    });
}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendMessage({'sdp': pc.localDescription}),
    onError
  );
}

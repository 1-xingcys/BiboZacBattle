import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import { useAuth } from '../../context/AuthContext';
import styles from './RoundLive.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import VoteChart from './VoteChart';


function RoundLive({ curRound, curVotes }) {
  const { user } = useAuth();

  if(!curRound.battling) return <ShowWatingRound/>;
  else if(curRound.status === 'inProgress') return <ShowBattling curRound={curRound}/>;
  else if(curRound.status === 'voting' && user.role === 'participant') return <ShowVotingChoice curRound={curRound}/>;
  else if(curRound.status === 'voting' && user.role === 'organizer') return <ShowVotingStatus curRound={curRound} curVotes={curVotes}/>;
  else if(curRound.status === 'checking') return <ShowVoteResult curRound={curRound} curVotes={curVotes}/>;
  else return <p>不知道</p>;
}

function ShowWatingRound() {
  return (
    <div className={styles.contentContainer}>等待對戰中...</div>
  );
}

function ShowBattling({ curRound }) {
  return (
    <div className={styles.contentContainer}>
      <p>{`${curRound.red_name} v.s ${curRound.blue_name} 對戰中`}</p>
    </div>
  );
}

function ShowVotingChoice({ curRound }) {
  const { user } = useAuth();
  const [isVote, setIsVote] = useState(false);
  const { eventId } = useParams();
  const canVote = curRound.red_name !== user.username && curRound.blue_name !== user.username;

  if(!canVote) {
    return (
      <>
        <h2 className={styles.h2}>您這場比賽無法投票</h2>
      </>
    );
  }

  useEffect(() => {
    socket.on('response_is_player_voted', (data) => {
      console.log(data);
      setIsVote(data);
    });
    
    return () => {
      socket.off('response_is_player_voted');
      socket.emit('request_is_player_voted', { eventId, roundId : curRound.r_id, p_name : user.username });
    };
  }, []);


  const handleVote = (side) => {
    setIsVote(true);
    socket.off('response_player_vote');
    socket.emit('reqest_player_vote', {eventId: eventId, roundId: curRound.r_id, username: user.username, side: side});
    socket.on('response_player_vote', (data) => {
      console.log(data);
      if(!data) setIsVote(false);
    });
  }

  return (
    <div className={styles.contentContainer}>
      {!isVote ? (
        <div className={styles.voteButtomContainer}>
          <button className={styles.voteButton} onClick={() => handleVote('red')} disabled={isVote}>{curRound.red_name}</button>
          <button className={styles.voteButton} onClick={() => handleVote('blue')} disabled={isVote}>{curRound.blue_name}</button>
          <button className={styles.voteButton} onClick={() => handleVote('tie')} disabled={isVote}>TIE</button>
        </div>
      ) : (
        <p>投票中</p>
      )}
    </div>
  );
}

function ShowVotingStatus({ curRound, curVotes }) {
  return (
    <>
    {curVotes && <VoteChart votes={curVotes} curRound={curRound}/>}
    </>
  );
}

function ShowVoteResult({ curRound, curVotes }) {
  let winner;
  if(curRound.res === "red"){
    winner = curRound.red_name;
  } else if(curRound.res === "blue"){
    winner = curRound.blue_name;
  } else if(curRound.res === "Tie"){
    winner = undefined;
  }

  return (
    <>
    <h2 className={styles.h2}>{winner ? `${winner} Win!` : `TIE`}</h2>
    {curVotes && <VoteChart votes={curVotes} curRound={curRound}/>}
    </>
  );
}

export default RoundLive;
import { AlertCircle, ArrowLeft, Clock, Dot, Vote } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import '../assets/css/quick-styles.css'
import '../assets/css/pollpage.css'
import MyBarChart from "../ui/MyBarChart";
import { useContext, useEffect, useState } from "react";
import { formatDate, getPollTotalVotes, Role } from "../assets/js/helper";
import { IElection, UserContext } from "../assets/js/UserContext";
import { toast } from "sonner";


function Choice({ text, setSelected, _id, selected }: { _id: string; text: string; setSelected: (value: string) => void; selected: string | null }) {
    return (
        <div className="flex choice-input-box">
            <input
                className="circular-checkbox"
                type="checkbox"
                id={_id}
                checked={selected === _id}
                onChange={() => setSelected(_id)}
            />
            <label htmlFor={_id}>{text}</label>
        </div>
    );
}

function PollPage({ role }: { role: Role }) {
    const { id: requested_poll_id } = useParams();
    const navigate = useNavigate();
    const context = useContext(UserContext);
    const [PollData, setPollData] = useState<IElection | undefined>(undefined);

    const [selected, setSelected] = useState<string | null>(null);
    const [card_width, setCardWidth] = useState(0);
    const [ongoing, setOngoing] = useState(false);



    async function vote() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vote`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pollId: requested_poll_id, optionId: selected, matric_no: context?.userData.matric_no }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Vote successful:", data.msg);
                toast.success(data.msg || 'Vote Casted!');

            } else {
                console.error("Casting Vote error:", data);
                toast.warning(data.msg)
            }
        } catch (error) {
            console.error("Voting error:", error);
        }
    }

    useEffect(() => {
        setOngoing(false)
        const handleResize = () => {
            const card_width = document.querySelector(".voting-card")?.getBoundingClientRect().width || 100;
            setCardWidth(card_width);
            console.log('card_width ', card_width, role)
        };
        handleResize();

        document.querySelector(".voting-card")?.addEventListener("resize", handleResize);
        return () => {
            document.querySelector(".voting-card")?.removeEventListener("resize", handleResize);
        };
    }, []);

    
    function newStatus(endDate: string | undefined) {
        console.log(endDate)
        if (!endDate) return false
        const today = new Date();
        return new Date(endDate) >= today
    }
    useEffect(() => {
        console.log(role,context?.PollsData)
        if (context?.PollsData) {
            setPollData(()=>{
                const the_one = context.PollsData.find(each_poll => each_poll._id === requested_poll_id)
                setOngoing(newStatus(the_one?.endDate))
                return the_one
            }); 

        }
    }, [context?.PollsData, requested_poll_id]);

    return (
        <div className="page poll-page">
            <button onClick={() => navigate(-1)} className="grey-btn back-btn">
                <ArrowLeft />
                Back
            </button>
            <section className="heading flex-wrap">
                <div>
                    <h1>{PollData?.title}</h1>
                    <p className="caption">{PollData?.description}</p>
                </div>
                <div className="flex algin-items-cen">
                    <div className={"badge state " + (newStatus(PollData?.endDate)?'active':'ended')}> <Dot /> {newStatus(PollData?.endDate)?'Active':'Closed'} </div>
                    <Clock className="caption clock" />
                    <p className="caption date"> {ongoing?'Ends':'Ended'}: {formatDate(PollData?.endDate || '')}</p>
                </div>
            </section>
            <main className="flex flex-wrap">
                {ongoing ?
                    <div className="voting-card">
                        <h3>Cast Your Vote</h3>
                        {
                            PollData?.options.map((each, i) => <Choice key={i} text={each.text} _id={each._id} selected={selected} setSelected={setSelected} />)
                        }
                        <button onClick={vote} className={"algin-items-cen primary-btn flex x-flex-align" + (selected ? '' : ' disabled')}> <Vote />  Submit Vote</button>
                    </div>
                    :
                    <div className="voting-card expired">
                        <AlertCircle />
                        <p>Voting Closed</p>
                        <p className="caption">This poll is no longer accepting votes</p>
                    </div> 
                }
                <div className="voting-card">
                    <h3>Results</h3>
                    <MyBarChart card_width={card_width} students={PollData?.options ? PollData?.options.map(each => each.text) : []} votes={PollData?.options ? PollData?.options.map(each => each.votes) : []} />
                    <p>Total votes: {getPollTotalVotes(PollData?.options)}</p>
                </div>
            </main>

            <section className="voter-details-section" style={{ marginTop: '40px' }}>
                <div className="voting-card" style={{ maxWidth: '100%' }}>
                    <h3>Detailed Voting Breakdown</h3>
                    <p className="caption">Transparent view of who voted for each candidate/option</p>
                    <div className="voter-lists-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {PollData?.options.map((option, index) => (
                            <div key={index} className="option-voter-list" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px' }}>
                                <h4 style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    {option.text}
                                    <span className="badge" style={{ background: '#e0e0e0', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{option.votes}</span>
                                </h4>
                                <div className="voters" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {option.voters && option.voters.length > 0 ? (
                                        option.voters.map((voter, i) => (
                                            <span 
                                                key={i} 
                                                title={voter}
                                                className="voter-tag" 
                                                style={{ 
                                                    background: '#4ec9e626', 
                                                    color: '#00708b', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '5px', 
                                                    fontSize: '13px',
                                                    maxWidth: '120px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {voter}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="caption" style={{ fontStyle: 'italic' }}>No votes yet</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};


export default PollPage;

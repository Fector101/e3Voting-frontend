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
                <div className="voting-card">
                    <h3>Verified Participants</h3>
                    <p className="caption">This poll is anonymous. Listed below are the students who have successfully cast their ballots.</p>
                    
                    <div className="participation-stats" style={{ display: 'flex', gap: '20px', margin: '20px 0', padding: '15px', background: '#f0f9ff', borderRadius: '10px', flexWrap: 'wrap' }}>
                        <div className="stat-item">
                            <h4 style={{ color: '#00708b' }}>Total Votes</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{getPollTotalVotes(PollData?.options)}</p>
                        </div>
                        <div className="stat-item">
                            <h4 style={{ color: '#00708b' }}>Unique Voters</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{
                                PollData?.voters?.length || 0
                            }</p>
                        </div>
                    </div>

                    <div className="voters-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                        {PollData?.voters && PollData.voters.length > 0 ? (
                            PollData.voters.map((matricNo, i) => (
                                <span 
                                    key={i} 
                                    className="voter-tag" 
                                    style={{ 
                                        background: '#f1f5f9', 
                                        color: '#475569', 
                                        padding: '6px 14px', 
                                        borderRadius: '6px', 
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        border: '1px solid #e2e8f0',
                                        fontFamily: 'monospace'
                                    }}
                                >
                                    {matricNo}
                                </span>
                            ))
                        ) : (
                            <p className="caption" style={{ fontStyle: 'italic' }}>No participation records yet</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};


export default PollPage;

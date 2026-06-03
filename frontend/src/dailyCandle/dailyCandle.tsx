import { apiURL } from '../../apiURL.js';

export default function DailyCandle(){
    
    async function getRandomCandleId(){
        const request = await fetch(`${apiURL()}/random`);
        const randomCandleId = request.json();
    }

    return(
        <div className="flex items-center w-full h-[45vh] border-4 border-gray-300 rounded-2xl">
            <div id="dailyCandleDiv" className="w-[40%] h-[50%] border-2 border-amber-100">
                
            </div>
        </div>
    )
}
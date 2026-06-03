import DailyCandle from '../dailyCandle/dailyCandle';

export default function Home(){
    return(
        <div className="flex flex-col justify-center items-center">
            <h1 className="font-candy text-[3em] mt-4">Candle Companion</h1>
            <DailyCandle />
        </div>
    )
}
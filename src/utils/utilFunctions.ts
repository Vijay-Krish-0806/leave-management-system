import { eachDayOfInterval, format } from "date-fns"

export const handleFormatDate=(date:string)=>{
    return format(new Date(date),"PPP")
}

export const dateInterval=(startDate:string,endDate:string)=>{
    return eachDayOfInterval({start:startDate,end:endDate})
}
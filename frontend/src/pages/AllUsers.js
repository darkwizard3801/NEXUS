import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import moment from 'moment'
import { MdModeEdit, MdDelete } from "react-icons/md";
import ChangeUserRole from '../components/ChangeUserRole';
import { CgProfile } from "react-icons/cg";




const AllUsers = () => {

    const [allUser,setAllUsers] = useState([])
    const [openUpdateRole,setOpenUpdateRole] = useState(false)
    const [updateUserDetails,setUpdateUserDetails] = useState({
        email : "",
        name : "",
        role : "",
        _id  : ""
    })




    const fetchAllUsers = async() =>{
        const fetchData = await fetch(SummaryApi.allUser.url,{
            method : SummaryApi.allUser.method,
            credentials : 'include'
        })

        const dataResponse = await fetchData.json()

        if(dataResponse.success){
            setAllUsers(dataResponse.data)
        }

        if(dataResponse.error){
            toast.error(dataResponse.message)
        }

    }



    useEffect(()=>{
        fetchAllUsers()
    },[])



  return (
    <div>
    <table className='w-full userTable'>
    <thead>
        <tr className='bg-black text-white'>
            <th>Sr.</th>
            <th>Name</th>
            <th>profilePic</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created Date</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody className=''>
        {
                 allUser.map((el,index) => {
                    return(

                        <tr>
                             <td>{index+1}</td>
                             <td>{el?.name}</td>
                             <td className=' px-2 flex  items-center justify-center'>
                                 {el?.profilePic ? (
                                     <img src={el.profilePic} alt={`${el.name}'s profile`} className='h-14 w-14 object-cover rounded-full ' />
                                 ) : (
                                     <CgProfile className='h-14 w-14 object-cover rounded-full' />
                                 )}
                             </td>
                             <td>{el?.email}</td>
                             <td>{el?.role}</td>
                             <td>{moment(el?.createdAt).format('LL')}</td>
                             <td>
                                <button className='bg-green-100 p-2 rounded-full cursor-pointer hover:bg-green-500 hover:text-white' onClick={()=>{
                                        setUpdateUserDetails(el)
                                        setOpenUpdateRole(true)

                                    }} >
                                <MdModeEdit/>
                                </button>
                                <button className='bg-red-100 p-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white ml-2' onClick={() => {
                                        // Add delete functionality here
                                    }}>
                                    <MdDelete />
                                </button>
                             </td>


                        </tr>


                    )
                })

        }



    </tbody>
    </table>

    {

openUpdateRole &&(

    <ChangeUserRole 
    onClose={()=>setOpenUpdateRole(false)} 
    name={updateUserDetails.name}
    email={updateUserDetails.email}
    role={updateUserDetails.role}
    userId={updateUserDetails._id}
    callFunc={fetchAllUsers}
    />
)

    }
    </div>
  )
}

export default AllUsers

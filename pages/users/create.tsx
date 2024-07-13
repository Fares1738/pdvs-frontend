"use client";

import styles from "../../styles/page.module.css";
import NavBar from "@/components/NavBar";
import { useBalance } from "wagmi";
import { Box, Tooltip } from "@mui/material";
import { useState } from "react";
import { isAddress } from "viem";
import { User } from "@/utils/types";
import { UserType } from "@prisma/client";
import { performBriefPOST } from "@/utils/httpRequest";
import RestrictedPage from "@/components/RestrictedPage";
import { ADDRESSES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";

type VariableState = {
  value: string;
  errorMsg?: string;
};

const defaultValue = {
  value: "",
  errorMsg: undefined,
} as VariableState;

type varKeys = "address" | "matricNumber" | "cgpa" | "userType";
const userTypes: UserType[] = [UserType.STUDENT, UserType.CM];
type VarKeys = {
  address: VariableState;
  matricNumber: VariableState;
  cgpa: VariableState;
  userType: VariableState;
  fullName: VariableState;
};

export default function Home() {
  const { data: balance } = useBalance({ address: ADDRESSES.keeper });
  const { isAuth } = useAuth();

  const [data, setData] = useState<VarKeys>({
    address: defaultValue,
    matricNumber: defaultValue,
    cgpa: defaultValue,
    userType: {
      value: UserType.STUDENT,
      errorMsg: undefined,
    },
    fullName: defaultValue,
  });

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let validation = false;
    let errorMsg: string | undefined = undefined;
    switch (name) {
      case "address":
        validation = isAddress(value);
        if (!validation) errorMsg = "Invalid address!";
        break;
      case "fullName":
        validation = true;
        break;
      case "matricNumber":
        validation = true; // TODO: Implement proper validation
        break;
      case "cgpa":
        validation = true; // TODO: Implement proper validation
        break;
      case "userType":
        validation = Object.values(UserType).includes(value as UserType);
        if (!validation) errorMsg = "Invalid UserType";
        break;
      default:
        validation = false;
        break;
    }

    setData((prev) => ({
      ...prev,
      [name]: {
        value,
        errorMsg,
      } as VariableState,
    }));
  };

  // Destructure data
  const { ...allData } = data;

  // Disable submit button until all fields are filled in
  const canSubmit = [...Object.values(allData)].every((v) => !v.errorMsg);

  async function submit() {
    const userObj: User = {
      cgpa: Number(data.cgpa.value),
      fullName: data.fullName.value,
      userType: data.userType.value as UserType,
      userAddress: data.address.value,
      matricNumber: data.matricNumber.value,
    };

    await performBriefPOST(
      "/api/users/create",
      JSON.stringify(userObj),
      "create user"
    );
  }

  return (
    <main>
      <NavBar />
      <Box className={styles.main}>
        <RestrictedPage validAccess={!!isAuth}>
          <>
            <h1 className="mb-16 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              Create New User{" "}
            </h1>
            <form method="POST" onSubmit={handleRegistration}>
              <div className="mb-4 flex justify-between">
                <Tooltip title="Keeper is the address used to register users in the server">
                  <label className="text-gray-700 font-bold">
                    Keeper Balance:
                  </label>
                </Tooltip>
                <label className="text-gray-700 font-bold">
                  {balance ? Number(balance.formatted).toFixed(4) : 0} tBNB
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name
                </label>
                <input
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="..."
                  value={data.fullName.value}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <input
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="address"
                  name="address"
                  type="text"
                  placeholder="0x..."
                  value={data.address.value}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Matric Number
                </label>
                <input
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="matricNumber"
                  name="matricNumber"
                  type="text"
                  placeholder="A23..."
                  value={data.matricNumber.value}
                />
              </div>

              <div className="max-w-lg w-58 mx-auto mb-4">
                <label
                  htmlFor="number-input"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Enter CGPA:
                </label>
                <input
                  type="number"
                  id="number-input"
                  min="0"
                  max="4"
                  step="0.01"
                  defaultValue="2.00"
                  aria-describedby="helper-text-explanation"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="3.89"
                  name="cgpa"
                  required
                  value={data.cgpa.value}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    let _value = value;

                    if (Number(value) > 4) {
                      _value = "4";
                    } else if (Number(value) < 0) {
                      _value = "0";
                    }

                    setData((prev) => ({
                      ...prev,
                      [name]: {
                        value: _value,
                        errorMsg: undefined,
                      } as VariableState,
                    }));
                  }}
                />
              </div>

              <div className="mb-4 w-52">
                <label
                  htmlFor="number-input"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Select User Type:
                </label>
                <div className="flex">
                  {userTypes.map((o, i) => (
                    <div key={i} className="inline-flex items-center">
                      <label
                        className="relative flex items-center p-3 rounded-full cursor-pointer"
                        htmlFor={o}
                      >
                        <input
                          onChange={handleChange}
                          defaultChecked={i === 0}
                          name="userType"
                          type="radio"
                          value={o}
                          className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-gray-900 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-gray-900 checked:before:bg-gray-900 hover:before:opacity-10"
                          id={o}
                        />
                        <span className="absolute text-gray-900 transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <circle
                              data-name="ellipse"
                              cx="8"
                              cy="8"
                              r="8"
                            ></circle>
                          </svg>
                        </span>
                      </label>
                      <label
                        className="mt-px cursor-pointer select-none text-gray-700 text-sm font-bold"
                        htmlFor={o}
                      >
                        {o}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                disabled={!canSubmit}
                type="submit"
                onClick={submit}
                className="btn btn-wide"
              >
                Register
              </button>
            </form>
          </>
        </RestrictedPage>
      </Box>
    </main>
  );
}
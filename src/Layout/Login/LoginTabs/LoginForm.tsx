import { useAppSelector } from "@/Redux/Hooks";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { Eye, EyeOff } from "react-feather";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, InputGroup, InputGroupText, Label } from "reactstrap";
import SocialMediaIcons from "./SocialMediaIcons";
import { useAuthService } from "../../../../Api/authService";

const LoginForm = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const [showPassWord, setShowPassWord] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });
  const { username, password } = formValues;
  const router = useRouter();
  const { login } = useAuthService(); // Use the login function from the auth service

  const handleUserValue = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };

  const formSubmitHandle = async (event: FormEvent) => {
    event.preventDefault();
    const response = await login(username, password); // Call the login API

    if (response && response.accessToken) {
      Cookies.set("token", response.accessToken); // Store the token in local storage
      router.push(`${process.env.PUBLIC_URL}/en/dashboard`); // Redirect to the dashboard
      
      toast.success("Login successful");
    } else {
      toast.error("Please Enter Valid Username Or Password");
    }
  };

  return (
    <Form className="form-horizontal auth-form" onSubmit={formSubmitHandle}>
      <FormGroup>
        <Input
          required
          onChange={handleUserValue}
          type="text"
          value={username}
          name="username"
          placeholder="Username"
          id="exampleInputUsername1"
        />
      </FormGroup>
      <FormGroup>
        <InputGroup onClick={() => setShowPassWord(!showPassWord)}>
          <Input
            required
            onChange={handleUserValue}
            type={showPassWord ? "text" : "password"}
            value={password}
            name="password"
            placeholder="Password"
          />
          <InputGroupText>{showPassWord ? <Eye /> : <EyeOff />}</InputGroupText>
        </InputGroup>
      </FormGroup>
      <div className="form-terms">
        <div className="custom-control custom-checkbox me-sm-2">
          <Label className="d-block">
            <Input className="checkbox_animated" id="chk-ani2" type="checkbox" />
            Remember Me
            <span className="pull-right">
              <Button color="transparent" className="forgot-pass p-0">
                Lost your password
              </Button>
            </span>
          </Label>
        </div>
      </div>
      <div className="form-button">
        <Button color="primary" type="submit">
          Login
        </Button>
      </div>
      <div className="form-footer">
        <span>Or login with social platforms</span>
        <SocialMediaIcons />
      </div>
    </Form>
  );
};

export default LoginForm;

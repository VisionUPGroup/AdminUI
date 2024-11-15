import { useAppSelector } from "@/Redux/Hooks";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { Eye, EyeOff } from "react-feather";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, InputGroup, InputGroupText, Label } from "reactstrap";
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
  const { login } = useAuthService();

  const handleUserValue = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };

  const formSubmitHandle = async (event: FormEvent) => {
    event.preventDefault();
    const response = await login(username, password);
  
    if (response && response.accessToken) {
      // Lưu token và role vào cookies
      Cookies.set("token", response.accessToken);
      Cookies.set("roleId", response.user.roleID);
      Cookies.set("userData", JSON.stringify({
        username: response.user.username,
        roleId: response.user.roleID,
        // Thêm các thông tin user khác nếu cần
      }));
      
      toast.success("Login successful");
      
      // Redirect dựa vào role
      if (response.user.roleID === "2") {
        router.push(`${process.env.PUBLIC_URL}/staff/dashboard`);
      } else if (response.user.roleID === "3") {
        router.push(`${process.env.PUBLIC_URL}/admin/dashboard`);
      } else {
        router.push(`${process.env.PUBLIC_URL}/dashboard`);
      }
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
          </Label>
        </div>
      </div>
      <div className="form-button">
        <Button color="primary" type="submit">
          Login
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
import React, { FunctionComponent, useState, useEffect } from "react";
import { Button, Col, Form, InputGroup } from "react-bootstrap";
import { useHistory } from "react-router";
import UserAPI from "../../core/api/user";
import User, { Address } from "../../models/user";
import { CenteredRow } from "../styled";
import { AddressFormPart, FormProps } from "./FormParts";
import { readDjangoError } from "../../core/client";
import styled from "styled-components";

const StyledButton = styled(Button)`
  margin: 10px;
`;

/**
 * The props for the {@link EditProfileForm}
 */
export interface EditProfileFormProps extends FormProps {
  /**
   * The user that want to edit their profile
   */
  user: User;
}

/**
 * A form for registering a new user
 *
 * @param props - The props
 */
export const EditProfileForm: FunctionComponent<EditProfileFormProps> = ({
  setError,
  user,
}: EditProfileFormProps) => {
  const history = useHistory();
  const [firstName, setFirstName] = useState<string>(user.first_name);
  const [lastName, setLastName] = useState<string>(user.last_name);
  const [email, setEmail] = useState<string>(user.email);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [address, setAddress] = useState<Address | undefined>(undefined);
  const [validated, setValidated] = useState<boolean>(false);

  useEffect(() => {
    //setAddress(user.address);
    if (user.phone_number) {
      setPhoneNumber(user.phone_number);
    }
  }, [user.phone_number]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // We use a state for this so that validation doesn't display
    // until after the first submission attempt
    setValidated(true);
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    if (!form.checkValidity() || !address) {
      e.stopPropagation();
      return;
    }

    const user: User = {
      email: email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      address: address,
    };

    UserAPI.editUser(user, password, address)
      .then(() => history.push("/login"))
      .catch((error) => {
        setError(error.response ? readDjangoError(error.response) : "En uforventet error oppstod!");
      });
  };

  return (
    <Form noValidate validated={validated} onSubmit={onSubmit}>
      <Form.Row>
        <Form.Group as={Col} controlId="form-edit-first-name">
          <Form.Label>Fornavn</Form.Label>

          <Form.Control
            defaultValue={firstName}
            autoFocus
            type="text"
            pattern="^[a-zA-Z\p{L}]+$"
            minLength={2}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="form-edit-last-name">
          <Form.Label>Etternavn</Form.Label>

          <Form.Control
            defaultValue={lastName}
            type="text"
            pattern="^[a-zA-Z\p{L}]+$"
            minLength={2}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </Form.Group>
      </Form.Row>

      <Form.Group controlId="form-edit-email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          defaultValue={email}
          type="email"
          minLength={7}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="form-edit-phonenumber">
        <Form.Label>Telefonnummer</Form.Label>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text id="basic-addon1">+47</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            defaultValue={phoneNumber.replace("+47", "")}
            type="text"
            pattern="[0-9]*"
            minLength={8}
            maxLength={17}
            onChange={(e) => setPhoneNumber("+47" + e.target.value)}
            required
          />
        </InputGroup>
      </Form.Group>

      {user.address ? <AddressFormPart onChange={setAddress} initial={user.address} /> : <br />}

      <Form.Group controlId="form-edit-password">
        <Form.Label>Bekreft passord</Form.Label>
        <Form.Control
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          isInvalid={validated}
          required
        />
        <CenteredRow noGutters>
          <StyledButton variant="secondary" href="/profile">
            Gå tilbake
          </StyledButton>
          <StyledButton variant="primary" type="submit">
            Rediger bruker
          </StyledButton>
          <Button variant="outline-info" href={"/editpassword"}>
            Rediger passord
          </Button>
        </CenteredRow>
      </Form.Group>
    </Form>
  );
};

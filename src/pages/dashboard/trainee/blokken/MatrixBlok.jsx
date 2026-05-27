import Competentiematrix from "../../../competentiematrix/Competentiematrix";

export default function MatrixBlok({ email }) {
  return (
    <div>
      <Competentiematrix
        rol="trainee"
        emailProp={email}
        toonUitloggen={false}
      />
    </div>
  );
}

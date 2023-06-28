function Button(props) {
  return (
    <button className={props.className ? props.className : "button"} {...props}>
      {props.value}
    </button>
  );
}

export default Button;

import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import Moment from "react-moment";
import { addLike, removeLike, deletePost } from "../../store/actions/post";
const PostItem = ({
  deletePost,
  showActions,
  addLike,
  removeLike,
  auth,
  post: { _id, text, name, avatar, user, likes, comments, date },
}) => {
  return (
    <div className="posts">
      <div className="post bg-white p-1 my-1">
        <div>
          <a href="profile.html">
            <img className="round-img" src={avatar} alt="" />
            <h4>{name}</h4>
          </a>
        </div>
        <div>
          <p className="my-1">{text}</p>
          <p className="post-date">
            Posted on <Moment format="YYYY/MM/DD">{date}</Moment>{" "}
          </p>
          {showActions && (
            <Fragment>
              <button
                type="button"
                className="btn btn-light"
                onClick={(e) => addLike(_id)}
              >
                <i className="fas fa-thumbs-up"></i>{" "}
                {likes.length > 0 && <span> {likes.length}</span>}
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={(e) => removeLike(_id)}
              >
                <i className="fas fa-thumbs-down"></i>
              </button>
              <Link to={`posts/${_id}`} className="btn btn-primary">
                Discussion{" "}
                {comments.length > 0 && (
                  <span className="comment-count">{comments.length}</span>
                )}
              </Link>

              {!auth.loading && user === auth.user._id && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={(e) => deletePost(_id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
PostItem.defaultProps = {
  showActions: true,
};
PostItem.propTypes = {
  auth: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { deletePost, addLike, removeLike })(
  PostItem
);

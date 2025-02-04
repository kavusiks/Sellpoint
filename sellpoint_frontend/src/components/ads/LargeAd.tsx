import React, { FunctionComponent, useEffect, useState } from "react";
import { AdImage, FavoriteAd } from "../../models/ad";
import "./ads.css";
import { useSessionContext } from "../../context/Session";
import AdAPI from "../../core/api/ad";
import {
  CenteredRow,
  LeftCenterRow,
  RightCenterRow,
  ShadowedContainer,
  SpaceBetweenCenterRow,
} from "../styled";
import { AdComponentProps, AdModifyDialog } from "./Ads";
import { Carousel, Image, Badge, Button, Toast } from "react-bootstrap";
import { useHistory } from "react-router";
import { Heart } from "react-bootstrap-icons";
import { ConfirmModal } from "../ConfirmModal";

interface AdImageProps {
  image: AdImage;
}

const AdImageComponent: FunctionComponent<AdImageProps> = ({ image }: AdImageProps) => {
  return (
    <>
      <Image className="ad-image-item d-block" src={image.url} alt={image.description} />

      <Carousel.Caption className="ad-image-description">
        <h3>{image.description}</h3>
      </Carousel.Caption>
    </>
  );
};

const AdImagePlaceholder: FunctionComponent = () => {
  return (
    <Image
      className="d-block w-100"
      src="https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
      alt="Ingen bilder"
    />
  );
};

/**
 * A full page ad view
 *
 * @param props - The props
 */
export const LargeAd: FunctionComponent<AdComponentProps> = ({
  ad,
  children,
}: AdComponentProps) => {
  const session = useSessionContext();
  const history = useHistory();

  const [isFavorite, setIsFavorite] = useState<boolean>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showToast, setToast] = useState(false);
  const [adCategoryName, setAdCategoryName] = useState<string>("");

  useEffect(() => {
    if (!ad.category) {
      return;
    }
    AdAPI.getCategoryById(ad.category).then((categoryName) => setAdCategoryName(categoryName.name));
  }, [ad.category]);

  useEffect(() => {
    if (session.user?.id) {
      AdAPI.getAllFavoritesByUserId(session.user.id).then((favorites) =>
        setIsFavorite(favorites.filter((a) => a.favorite_ad === ad.id).length !== 0),
      );
    }
  }, [session.user, ad.id]);

  const isThumbnail = (img: AdImage): boolean => {
    return !!ad.thumbnail && ad.thumbnail.url === img.url;
  };

  // At first this returned the Carousel.Item components directly,
  // but that didn't work at all for some reason.
  const makeCarouselComponents = () => {
    const images = [];

    if (!ad.images || ad.images?.length === 0) {
      images.push(<AdImagePlaceholder />);
      return images;
    }

    if (ad.thumbnail) {
      images.push(<AdImageComponent image={ad.thumbnail} />);
    }

    ad.images.forEach((image) => {
      if (isThumbnail(image)) {
        return;
      }

      images.push(<AdImageComponent image={image} />);
    });

    return images;
  };

  const handleAddFavoriteAd = () => {
    if (session.user?.id && ad.id) {
      const userAccount: number = session.user.id;
      const favoriteAd: number = ad.id;

      const tempFavoriteAd: FavoriteAd = {
        user: userAccount,
        favorite_ad: favoriteAd,
      };

      AdAPI.createFavorite(tempFavoriteAd);
      setIsFavorite(true);
      showConfirmationToast();
    }
  };

  const handleRemoveFavoriteAd = () => {
    if (session.user?.id && ad.id) {
      const userAccount: number = session.user.id;
      const favoriteAd: number = ad.id;

      const tempFavoriteAd: FavoriteAd = {
        user: userAccount,
        favorite_ad: favoriteAd,
      };

      AdAPI.deleteFavorite(tempFavoriteAd);
      setIsFavorite(false);
    }
  };

  const deleteFavoriteDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowModal(true);
  };

  const removeToast = () => {
    setToast(false);
  };

  const showConfirmationToast = () => {
    setToast(true);
  };

  // Shows the favoritebutton if a user is logged in and the owner of the ad
  // is not the user
  const makeFavoriteButton = () => {
    return session.user && ad.owner ? (
      session.isAuthenticated && ad.owner.email !== session.user.email ? (
        isFavorite ? (
          <>
            <Button variant="success" onClick={deleteFavoriteDialog}>
              <Heart /> Fjern lagret annonse
            </Button>
            <br />
          </>
        ) : (
          <>
            <Button variant="outline-success" onClick={handleAddFavoriteAd}>
              <Heart /> Lagre annonsen
            </Button>
            <br />
          </>
        )
      ) : null
    ) : null;
  };

  const dist = ad.distance ?? 0;

  return (
    <>
      <ShadowedContainer className="ad large">
        <ConfirmModal
          show={showModal}
          setShow={setShowModal}
          onConfirm={handleRemoveFavoriteAd}
          confirmMessage="Slett Annonsen"
        >
          Er du sikker på at du vil slette annonsen &apos;{ad.title}&apos; fra dine favoritter?
        </ConfirmModal>
        <CenteredRow noGutters>
          <Carousel interval={null} slide={false}>
            {makeCarouselComponents().map((component, idx) => {
              return <Carousel.Item key={idx}>{component}</Carousel.Item>;
            })}
          </Carousel>
        </CenteredRow>

        <Toast
          style={{
            position: "fixed",
            top: 10,
          }}
          onClose={removeToast}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <p style={{ fontSize: 25 }} className="mr-auto">
              Annonsen ble lagret!
            </p>
          </Toast.Header>
        </Toast>

        <SpaceBetweenCenterRow noGutters>
          <h2>
            {ad.title} {ad.category ? <Badge variant="info">{adCategoryName}</Badge> : null}{" "}
            {ad.is_sold ? <Badge variant="success">Solgt!</Badge> : null}
          </h2>
          <RightCenterRow noGutters>
            {
              // Check if this is our own ad, if so we should display edit buttons etc.
              session.user && ad.owner?.email === session.user.email ? (
                <AdModifyDialog ad={ad} onDeleted={() => history.push("/")} />
              ) : (
                <p>
                  {dist <= 0
                    ? null
                    : (dist <= 1 ? "< 1 " : `~${ad.distance}`) + " km unna din addresse"}
                </p>
              )
            }
          </RightCenterRow>
          <hr style={{ width: "100%", margin: "0px 0px 10px 0px" }} />
        </SpaceBetweenCenterRow>

        <LeftCenterRow noGutters>
          <div className="ad info">
            <p>
              {makeFavoriteButton()}
              <>
                <hr style={{ width: "100%", margin: "10px 0px 10px 0px" }} />
                <div className="ad desc">
                  <p>{ad.description}</p>
                </div>
                {children}
              </>
              <strong>Pris:</strong> {ad.price},-
              <br />
              <strong>Selger: </strong>{" "}
              <a href={`/visit-profile/${ad.owner?.id}`}>
                {ad.owner?.first_name} {ad.owner?.last_name}
              </a>
              <br />
              <strong>Telefonnummer: </strong> {ad.owner?.phone_number}
              <br />
              <strong>E-mail: </strong> <a href={"mailto:" + ad.owner?.email}>{ad.owner?.email}</a>
              <br />
            </p>
          </div>
          <hr style={{ width: "100%", margin: "10px 0px 10px 0px" }} />
          <div className="edit ad">
            {
              /*If a user is a super user, the button"Rediger Annonse" will show.
       It will take the super user directly to the admin site for this ad,
       where the editing can be done*/
              session.user?.is_staff ? (
                <Button
                  href={"http://127.0.0.1:8000/admin/sellpoint_ads/ad/" + ad.id + "/change/"}
                  variant="outline-primary"
                  target="_blank"
                >
                  Rediger Annonse
                </Button>
              ) : null
            }
          </div>
        </LeftCenterRow>
        {children}
      </ShadowedContainer>
    </>
  );
};

export default LargeAd;

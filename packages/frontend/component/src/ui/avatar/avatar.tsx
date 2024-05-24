import { CloseIcon } from '@blocksuite/icons';
import type {
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarProps as RadixAvatarProps,
} from '@radix-ui/react-avatar';
import {
  Fallback as AvatarFallback,
  Image as AvatarImage,
  Root as AvatarRoot,
} from '@radix-ui/react-avatar';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';
import type {
  CSSProperties,
  HTMLAttributes,
  MouseEvent,
  ReactElement,
} from 'react';
import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { IconButton } from '../button';
import type { TooltipProps } from '../tooltip';
import { Tooltip } from '../tooltip';
import { ColorfulFallback } from './colorful-fallback';
import * as style from './style.css';
import { blurVar, sizeVar } from './style.css';

export type AvatarProps = {
  size?: number;
  url?: string | null;
  image?: HTMLImageElement /* use pre-loaded image element can avoid flashing */;
  name?: string;
  className?: string;
  style?: CSSProperties;
  colorfulFallback?: boolean;
  hoverIcon?: ReactElement;
  onRemove?: (e: MouseEvent<HTMLButtonElement>) => void;
  avatarTooltipOptions?: Omit<TooltipProps, 'children'>;
  removeTooltipOptions?: Omit<TooltipProps, 'children'>;

  fallbackProps?: AvatarFallbackProps;
  imageProps?: Omit<
    AvatarImageProps & React.HTMLProps<HTMLCanvasElement>,
    'src' | 'ref'
  >;
  avatarProps?: RadixAvatarProps;
  hoverWrapperProps?: HTMLAttributes<HTMLDivElement>;
  removeButtonProps?: HTMLAttributes<HTMLButtonElement>;
} & HTMLAttributes<HTMLSpanElement>;

function drawImageFit(
  img: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  size: number
) {
  const hRatio = size / img.naturalWidth;
  const vRatio = size / img.naturalHeight;
  const ratio = Math.max(hRatio, vRatio);
  const centerShift_x = (size - img.naturalWidth * ratio) / 2;
  const centerShift_y = (size - img.naturalHeight * ratio) / 2;
  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    centerShift_x,
    centerShift_y,
    img.naturalWidth * ratio,
    img.naturalHeight * ratio
  );
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      size = 20,
      style: propsStyles = {},
      url,
      image,
      name,
      className,
      colorfulFallback = false,
      hoverIcon,
      fallbackProps: { className: fallbackClassName, ...fallbackProps } = {},
      imageProps,
      avatarProps,
      onRemove,
      hoverWrapperProps: {
        className: hoverWrapperClassName,
        ...hoverWrapperProps
      } = {},
      avatarTooltipOptions,
      removeTooltipOptions,
      removeButtonProps: {
        className: removeButtonClassName,
        ...removeButtonProps
      } = {},
      ...props
    },
    ref
  ) => {
    const firstCharOfName = useMemo(() => {
      return name?.slice(0, 1) || 'A';
    }, [name]);
    const [containerDom, setContainerDom] = useState<HTMLDivElement | null>(
      null
    );
    const [removeButtonDom, setRemoveButtonDom] =
      useState<HTMLButtonElement | null>(null);
    const canvas = useRef<HTMLCanvasElement>(null);

    useLayoutEffect(() => {
      if (canvas.current && image) {
        const draw = () => {
          const ctx = canvas.current?.getContext('2d');
          if (ctx) {
            drawImageFit(image, ctx, size * window.devicePixelRatio);
          }
        };
        draw();
        image.addEventListener('load', draw);
        return () => {
          image.removeEventListener('load', draw);
        };
      }
      return;
    }, [image, size]);

    return (
      <AvatarRoot className={style.avatarRoot} {...avatarProps} ref={ref}>
        <Tooltip
          portalOptions={{ container: containerDom }}
          {...avatarTooltipOptions}
        >
          <div
            ref={setContainerDom}
            className={clsx(style.avatarWrapper, className)}
            style={{
              ...assignInlineVars({
                [sizeVar]: size ? `${size}px` : '20px',
                [blurVar]: `${size * 0.3}px`,
              }),
              ...propsStyles,
            }}
            {...props}
          >
            {image /* canvas mode */ ? (
              <canvas
                className={style.avatarImage}
                ref={canvas}
                width={size * window.devicePixelRatio}
                height={size * window.devicePixelRatio}
                {...imageProps}
              />
            ) : (
              <AvatarImage
                className={style.avatarImage}
                src={url || ''}
                alt={name}
                {...imageProps}
              />
            )}

            {!image /* no fallback on canvas mode */ && (
              <AvatarFallback
                className={clsx(style.avatarFallback, fallbackClassName)}
                delayMs={url ? 600 : undefined}
                {...fallbackProps}
              >
                {colorfulFallback ? (
                  <ColorfulFallback char={firstCharOfName} />
                ) : (
                  firstCharOfName.toUpperCase()
                )}
              </AvatarFallback>
            )}
            {hoverIcon ? (
              <div
                className={clsx(style.hoverWrapper, hoverWrapperClassName)}
                {...hoverWrapperProps}
              >
                {hoverIcon}
              </div>
            ) : null}
          </div>
        </Tooltip>

        {onRemove ? (
          <Tooltip
            portalOptions={{ container: removeButtonDom }}
            {...removeTooltipOptions}
          >
            <IconButton
              size="extraSmall"
              type="default"
              className={clsx(style.removeButton, removeButtonClassName)}
              onClick={onRemove}
              ref={setRemoveButtonDom}
              {...removeButtonProps}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </AvatarRoot>
    );
  }
);

Avatar.displayName = 'Avatar';
